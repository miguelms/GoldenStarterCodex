import { NextResponse } from "next/server";
import { syncEventSchema, type ProcessedSyncEvent, type SyncEvent } from "@starter/contracts";
import { processIncomingSyncEvent } from "@/domain/devices";
import { assertOrganizationAccess, getRequestContext } from "@/server/auth";
import { ApiHttpError, handleRouteError } from "@/server/errors";
import { getStore } from "@/server/store";

export async function GET(request: Request) {
  const context = getRequestContext(request);
  try {
    const url = new URL(request.url, "http://localhost");
    const targetOrgId = url.searchParams.get("organizationId") ?? context.organizationId;
    assertOrganizationAccess(context, targetOrgId);

    const store = getStore();
    const events = store.listSyncEvents(targetOrgId);
    return NextResponse.json({ events });
  } catch (error) {
    return handleRouteError(error, context.requestId);
  }
}

export async function POST(request: Request) {
  const context = getRequestContext(request);
  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      throw new ApiHttpError(400, "BAD_REQUEST", "Request body is required");
    }

    let rawList: unknown[];
    if (Array.isArray(body)) {
      rawList = body;
    } else if (
      typeof body === "object" &&
      body !== null &&
      "events" in body &&
      Array.isArray((body as { events: unknown[] }).events)
    ) {
      rawList = (body as { events: unknown[] }).events;
    } else if (typeof body === "object" && body !== null && "clientEventId" in body) {
      rawList = [body];
    } else {
      throw new ApiHttpError(
        400,
        "BAD_REQUEST",
        "Expected sync event object, an array of events, or { events: [...] }"
      );
    }

    const store = getStore();
    const headerDeviceId = request.headers.get("x-device-id");
    const processedEvents: ProcessedSyncEvent[] = [];
    let quarantinedCount = 0;

    for (const raw of rawList) {
      const parsedEvent: SyncEvent = syncEventSchema.parse(raw);

      // Multi-tenant boundary check
      const payloadOrg = (parsedEvent.payload as { organizationId?: string })?.organizationId ?? context.organizationId;
      if (payloadOrg) {
        assertOrganizationAccess(context, payloadOrg);
      }

      // 1. Idempotency check: if clientEventId was already processed, return existing
      const existing = store.getSyncEvent(parsedEvent.clientEventId);
      if (existing) {
        if (existing.status === "review_required") {
          quarantinedCount++;
        }
        processedEvents.push(existing);
        continue;
      }

      // 2. Resolve originating device
      const targetDeviceId = parsedEvent.deviceId ?? headerDeviceId;
      const device = targetDeviceId ? store.getDevice(targetDeviceId) : undefined;

      const deviceCandidate = device ?? {
        id: targetDeviceId ?? "unknown-device",
        organizationId: context.organizationId,
        status: "active" as const,
      };

      // 3. Process event against device state
      const processed = processIncomingSyncEvent(parsedEvent, deviceCandidate);

      if (processed.status === "review_required") {
        quarantinedCount++;
        store.recordAudit({
          id: crypto.randomUUID(),
          organizationId: context.organizationId,
          kind: "SYNC_EVENT_QUARANTINED",
          payload: {
            clientEventId: parsedEvent.clientEventId,
            deviceId: targetDeviceId,
            reason: processed.quarantineReason,
          },
          createdAt: new Date().toISOString(),
        });
      } else {
        store.recordAudit({
          id: crypto.randomUUID(),
          organizationId: context.organizationId,
          kind: "SYNC_EVENT_ACCEPTED",
          payload: {
            clientEventId: parsedEvent.clientEventId,
            deviceId: targetDeviceId,
          },
          createdAt: new Date().toISOString(),
        });
      }

      // Persist event idempotently
      store.recordSyncEvent(processed);
      processedEvents.push(processed);
    }

    return NextResponse.json({
      success: true,
      processedCount: processedEvents.length,
      quarantinedCount,
      events: processedEvents,
    });
  } catch (error) {
    return handleRouteError(error, context.requestId);
  }
}
