import type { DeviceStatus, SyncEventStatus } from "@starter/contracts";

export type SyncEventCandidate = {
  clientEventId: string;
  deviceId?: string;
  type: string;
  status?: SyncEventStatus;
  occurredAt: string;
  payload: Record<string, unknown>;
  [key: string]: unknown;
};

export type DeviceCandidate = {
  id: string;
  organizationId: string;
  status: DeviceStatus | string;
  revocationReason?: string | null;
  [key: string]: unknown;
};

export type ProcessedSyncEvent<T extends SyncEventCandidate = SyncEventCandidate> = T & {
  deviceId: string;
  status: SyncEventStatus;
  quarantineReason?: string;
};

export function isDeviceRevoked(device: DeviceCandidate): boolean {
  return device.status === "revoked";
}

/**
 * Procesa un evento entrante de sincronización offline evaluando el estado del dispositivo origen.
 * - Si device.status === 'revoked': asigna status 'review_required' para aislar el evento
 *   en cuarentena fuera de las operaciones directas hasta revisión administrativa.
 * - Si device.status === 'active': asigna status 'accepted'.
 *
 * Función pura: no muta el evento original y genera un nuevo registro.
 */
export function processIncomingSyncEvent<
  TEvent extends SyncEventCandidate,
  TDevice extends DeviceCandidate,
>(event: TEvent, device: TDevice): ProcessedSyncEvent<TEvent> {
  const isRevoked = device.status === "revoked";

  if (isRevoked) {
    const reason =
      device.revocationReason && device.revocationReason.trim().length > 0
        ? `Device revoked: ${device.revocationReason.trim()}`
        : "Device has been revoked by administration; event held in quarantine";

    return {
      ...event,
      deviceId: event.deviceId ?? device.id,
      status: "review_required" as const,
      quarantineReason: reason,
    };
  }

  return {
    ...event,
    deviceId: event.deviceId ?? device.id,
    status: "accepted" as const,
  };
}
