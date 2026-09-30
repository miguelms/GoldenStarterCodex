import { beforeEach, describe, expect, it } from "vitest";
import { POST as postSyncEvents } from "@/app/api/sync/route";
import { getStore } from "@/server/store";

describe("T-007 Regression: Outbox sync idempotency and audit deduplication (AC-002)", () => {
  beforeEach(() => {
    getStore().reset();
  });

  it("does not re-emit SYNC_EVENT_ACCEPTED audit entries when retrying the same clientEventId (AC-002)", async () => {
    const store = getStore();
    const clientEventId = "evt-regression-retry-001";
    const payload = {
      clientEventId,
      deviceId: "device-demo-001",
      type: "attendance",
      occurredAt: "2026-09-20T14:30:00.000Z",
      payload: {
        organizationId: "org-demo-001",
        kind: "check_in",
        shiftId: "shift-demo-001",
      },
    };

    const makeRequest = () =>
      new Request("http://localhost/api/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": "org-demo-001",
        },
        body: JSON.stringify(payload),
      });

    // 1. Initial sync attempt
    const res1 = await postSyncEvents(makeRequest());
    expect(res1.status).toBe(200);

    const initialAuditEntries = store
      .listAuditEntries("org-demo-001")
      .filter(
        (entry) =>
          entry.kind === "SYNC_EVENT_ACCEPTED" &&
          (entry.payload as { clientEventId?: string })?.clientEventId === clientEventId,
      );
    expect(initialAuditEntries.length).toBe(1);

    // 2. Retry sync attempt with identical clientEventId (outbox retransmit)
    const res2 = await postSyncEvents(makeRequest());
    expect(res2.status).toBe(200);

    const data2 = await res2.json();
    expect(data2.processedCount).toBe(1);
    expect(data2.events[0].clientEventId).toBe(clientEventId);

    // Invariant AC-002: Server must return existing record without re-processing
    // and must NOT re-emit SYNC_EVENT_ACCEPTED audit entry.
    const retryAuditEntries = store
      .listAuditEntries("org-demo-001")
      .filter(
        (entry) =>
          entry.kind === "SYNC_EVENT_ACCEPTED" &&
          (entry.payload as { clientEventId?: string })?.clientEventId === clientEventId,
      );

    expect(
      retryAuditEntries.length,
      "Expected exactly 1 SYNC_EVENT_ACCEPTED audit entry across retries, but found duplicates",
    ).toBe(1);
  });

  it("does not re-process or quarantine an already accepted event if device is revoked before retry", async () => {
    const store = getStore();
    const clientEventId = "evt-regression-device-change-002";
    const payload = {
      clientEventId,
      deviceId: "device-demo-001",
      type: "attendance",
      occurredAt: "2026-09-20T14:35:00.000Z",
      payload: {
        organizationId: "org-demo-001",
        kind: "check_in",
        shiftId: "shift-demo-001",
      },
    };

    const makeRequest = () =>
      new Request("http://localhost/api/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": "org-demo-001",
        },
        body: JSON.stringify(payload),
      });

    // 1. Initial sync with active device -> accepted
    const res1 = await postSyncEvents(makeRequest());
    expect(res1.status).toBe(200);
    const data1 = await res1.json();
    expect(data1.events[0].status).toBe("accepted");

    // 2. Device is revoked after initial acceptance
    store.updateDevice("device-demo-001", {
      status: "revoked",
      revocationReason: "Device lost in field",
    });

    // 3. Retry sync with same clientEventId
    const res2 = await postSyncEvents(makeRequest());
    expect(res2.status).toBe(200);
    const data2 = await res2.json();

    // Invariant AC-002: The event was already accepted; retry must return the existing accepted record
    // without re-evaluating device policy or altering event status to review_required.
    expect(data2.events[0].status).toBe("accepted");
    expect(data2.quarantinedCount).toBe(0);

    const quarantinedAuditEntries = store
      .listAuditEntries("org-demo-001")
      .filter(
        (entry) =>
          entry.kind === "SYNC_EVENT_QUARANTINED" &&
          (entry.payload as { clientEventId?: string })?.clientEventId === clientEventId,
      );
    expect(quarantinedAuditEntries.length).toBe(0);
  });

  it("does not re-emit SYNC_EVENT_QUARANTINED audit entries when retrying a quarantined event", async () => {
    const store = getStore();
    // Pre-revoke device
    store.updateDevice("device-demo-001", {
      status: "revoked",
      revocationReason: "Stolen device",
    });

    const clientEventId = "evt-regression-quarantine-retry-003";
    const payload = {
      clientEventId,
      deviceId: "device-demo-001",
      type: "vital_sign",
      occurredAt: "2026-09-20T14:40:00.000Z",
      payload: {
        organizationId: "org-demo-001",
        systolic: 120,
        diastolic: 80,
      },
    };

    const makeRequest = () =>
      new Request("http://localhost/api/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": "org-demo-001",
        },
        body: JSON.stringify(payload),
      });

    // 1. Initial sync with revoked device -> review_required
    const res1 = await postSyncEvents(makeRequest());
    expect(res1.status).toBe(200);
    const data1 = await res1.json();
    expect(data1.quarantinedCount).toBe(1);
    expect(data1.events[0].status).toBe("review_required");

    const initialQuarantineAudits = store
      .listAuditEntries("org-demo-001")
      .filter(
        (entry) =>
          entry.kind === "SYNC_EVENT_QUARANTINED" &&
          (entry.payload as { clientEventId?: string })?.clientEventId === clientEventId,
      );
    expect(initialQuarantineAudits.length).toBe(1);

    // 2. Retry sync with same clientEventId
    const res2 = await postSyncEvents(makeRequest());
    expect(res2.status).toBe(200);
    const data2 = await res2.json();
    expect(data2.quarantinedCount).toBe(1);
    expect(data2.events[0].status).toBe("review_required");

    // Invariant AC-002: Must not duplicate SYNC_EVENT_QUARANTINED audit entry
    const retryQuarantineAudits = store
      .listAuditEntries("org-demo-001")
      .filter(
        (entry) =>
          entry.kind === "SYNC_EVENT_QUARANTINED" &&
          (entry.payload as { clientEventId?: string })?.clientEventId === clientEventId,
      );
    expect(
      retryQuarantineAudits.length,
      "Expected exactly 1 SYNC_EVENT_QUARANTINED audit entry across retries, but found duplicates",
    ).toBe(1);
  });
});
