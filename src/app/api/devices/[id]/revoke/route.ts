import { NextResponse } from "next/server";
import { deviceRevokeInputSchema } from "@starter/contracts";
import { getRequestContext } from "@/server/auth";
import { ApiHttpError, handleRouteError } from "@/server/errors";
import { getStore } from "@/server/store";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const authContext = getRequestContext(request);
  try {
    if (authContext.role !== "admin_global" && authContext.role !== "org_admin") {
      throw new ApiHttpError(403, "FORBIDDEN", "Device revocation requires administrator role");
    }

    const { id } = await context.params;
    if (!id) {
      throw new ApiHttpError(400, "BAD_REQUEST", "Missing device ID parameter");
    }

    const store = getStore();
    const device = store.getDevice(id);
    if (!device) {
      throw new ApiHttpError(404, "NOT_FOUND", `Device '${id}' was not found`);
    }

    const body = await request.json().catch(() => ({}));
    const parsed = deviceRevokeInputSchema.parse(body);

    const now = new Date().toISOString();
    const updatedDevice = store.updateDevice(id, {
      status: "revoked",
      revokedAt: now,
      revokedBy: parsed.revokedBy ?? authContext.userId,
      revocationReason: parsed.revocationReason ?? "Dispositivo revocado por políticas de seguridad",
    });

    store.recordAudit({
      id: crypto.randomUUID(),
      organizationId: device.organizationId,
      kind: "DEVICE_REVOKED",
      payload: {
        fingerprint: device.deviceFingerprint,
        revokedBy: updatedDevice?.revokedBy,
        revocationReason: updatedDevice?.revocationReason,
        revokedAt: updatedDevice?.revokedAt,
      },
      userId: authContext.userId,
      createdAt: now,
    });

    return NextResponse.json({
      success: true,
      device: updatedDevice,
    });
  } catch (error) {
    return handleRouteError(error, authContext.requestId);
  }
}
