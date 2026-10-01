import { describe, expect, it } from "vitest";
import {
  deviceRevokeInputSchema,
  deviceSchema,
  quarantineSyncEventSchema,
  syncEventSchema,
  type Device,
  type SyncEvent,
} from "@starter/contracts";
import {
  isDeviceRevoked,
  processIncomingSyncEvent,
  type DeviceCandidate,
  type SyncEventCandidate,
} from "@/domain/devices";

describe("AC-007: Lost Device Policy, Revocation & Offline Sync Quarantine", () => {
  const activeDevice: DeviceCandidate = {
    id: "device-demo-pixel-001",
    organizationId: "org-demo-001",
    deviceFingerprint: "fp-pixel-001-active",
    assignedUserId: "caregiver-demo-001",
    status: "active",
    revokedAt: null,
    revokedBy: null,
    revocationReason: null,
  };

  const revokedDevice: DeviceCandidate = {
    id: "device-demo-pixel-002",
    organizationId: "org-demo-001",
    deviceFingerprint: "fp-pixel-002-lost",
    assignedUserId: "caregiver-demo-001",
    status: "revoked",
    revokedAt: "2026-09-20T11:00:00.000Z",
    revokedBy: "user-admin-global-001",
    revocationReason: "Dispositivo reportado como extraviado durante traslado domiciliario",
  };

  const sampleSyncEvent: SyncEventCandidate = {
    clientEventId: "evt-offline-001-uuid",
    type: "vital_sign",
    occurredAt: "2026-09-20T10:30:00.000Z",
    payload: {
      organizationId: "org-demo-001",
      patientId: "patient-demo-001",
      name: "temperature",
      value: 36.8,
      unit: "°C",
    },
  };

  // --------------------------------------------------------------------------
  // 1. Processing Events from Active Devices
  // --------------------------------------------------------------------------
  describe("processIncomingSyncEvent with Active Device", () => {
    it("accepts incoming sync event when device is active without quarantining", () => {
      const eventSnapshot = { ...sampleSyncEvent };
      const deviceSnapshot = { ...activeDevice };

      const processed = processIncomingSyncEvent(sampleSyncEvent, activeDevice);

      expect(processed.status).toBe("accepted");
      expect(processed.deviceId).toBe(activeDevice.id);
      expect(processed.quarantineReason).toBeUndefined();
      expect(processed.clientEventId).toBe(sampleSyncEvent.clientEventId);
      expect(processed.payload).toEqual(sampleSyncEvent.payload);

      // Verify immutability: inputs were not modified
      expect(sampleSyncEvent).toEqual(eventSnapshot);
      expect(activeDevice).toEqual(deviceSnapshot);
    });

    it("preserves deviceId if already present in incoming event", () => {
      const eventWithDevice = {
        ...sampleSyncEvent,
        deviceId: "device-custom-id",
      };
      const processed = processIncomingSyncEvent(eventWithDevice, activeDevice);
      expect(processed.deviceId).toBe("device-custom-id");
    });
  });

  // --------------------------------------------------------------------------
  // 2. Quarantine Processing for Revoked Devices (AC-007)
  // --------------------------------------------------------------------------
  describe("processIncomingSyncEvent with Revoked Device (Lost Device Quarantine)", () => {
    it("quarantines event with status review_required and attaches revocation reason", () => {
      const processed = processIncomingSyncEvent(sampleSyncEvent, revokedDevice);

      expect(processed.status).toBe("review_required");
      expect(processed.deviceId).toBe(revokedDevice.id);
      expect(processed.quarantineReason).toBe(`Device revoked: ${revokedDevice.revocationReason}`);

      // Verify event payload is kept intact for audit/investigation
      expect(processed.payload).toEqual(sampleSyncEvent.payload);

      // Validate against Zod quarantine schema
      const zodValidation = quarantineSyncEventSchema.safeParse(processed);
      expect(zodValidation.success).toBe(true);
    });

    it("uses default quarantine reason if device has empty or whitespace revocationReason", () => {
      const revokedWithoutReason: DeviceCandidate = {
        ...revokedDevice,
        revocationReason: null,
      };

      const processed = processIncomingSyncEvent(sampleSyncEvent, revokedWithoutReason);

      expect(processed.status).toBe("review_required");
      expect(processed.quarantineReason).toBe(
        "Device has been revoked by administration; event held in quarantine",
      );
    });

    it("quarantines multiple event types (vitals, soapie, tasks, attendance)", () => {
      const eventTypes = ["vital_sign", "soapie", "task", "attendance", "procedure"] as const;

      for (const type of eventTypes) {
        const event: SyncEventCandidate = {
          clientEventId: `evt-${type}-001`,
          type,
          occurredAt: "2026-09-20T10:00:00.000Z",
          payload: { organizationId: "org-demo-001", test: true },
        };

        const result = processIncomingSyncEvent(event, revokedDevice);
        expect(result.status).toBe("review_required");
        expect(result.quarantineReason).toContain("Device revoked");
      }
    });
  });

  // --------------------------------------------------------------------------
  // 3. Helper isDeviceRevoked
  // --------------------------------------------------------------------------
  describe("isDeviceRevoked helper", () => {
    it("returns true for revoked device and false for active device", () => {
      expect(isDeviceRevoked(revokedDevice)).toBe(true);
      expect(isDeviceRevoked(activeDevice)).toBe(false);
    });
  });

  // --------------------------------------------------------------------------
  // 4. Batch Offline Synchronization Simulation
  // --------------------------------------------------------------------------
  describe("Batch offline synchronization from lost device", () => {
    it("quarantines all offline events preventing automatic EHR incorporation", () => {
      const offlineQueue: SyncEventCandidate[] = [
        {
          clientEventId: "evt-offline-001",
          type: "telemetry",
          occurredAt: "2026-09-20T09:15:00.000Z",
          payload: { organizationId: "org-demo-001", metric: "cpu_usage", value: 45, unit: "percent" },
        },
        {
          clientEventId: "evt-offline-002",
          type: "field_note",
          occurredAt: "2026-09-20T09:30:00.000Z",
          payload: {
            organizationId: "org-demo-001",
            note: "Operación de campo completada satisfactoriamente.",
          },
        },
        {
          clientEventId: "evt-offline-003",
          type: "task",
          occurredAt: "2026-09-20T09:45:00.000Z",
          payload: { organizationId: "org-demo-001", taskId: "task-field-001", status: "completed" },
        },
      ];

      // Process batch with revoked device
      const results = offlineQueue.map((evt) => processIncomingSyncEvent(evt, revokedDevice));

      // Assert all were quarantined
      expect(results).toHaveLength(3);
      expect(results.every((r) => r.status === "review_required")).toBe(true);
      expect(results.filter((r) => r.status === "accepted")).toHaveLength(0);

      // Verify each item preserves client identity and org isolation
      for (const res of results) {
        expect(res.deviceId).toBe(revokedDevice.id);
        expect((res.payload as { organizationId: string }).organizationId).toBe("org-demo-001");
      }
    });
  });

  // --------------------------------------------------------------------------
  // 5. Schema Contract Validation: deviceRevokeInputSchema & deviceSchema
  // --------------------------------------------------------------------------
  describe("Zod Contracts for Device Revocation", () => {
    it("validates deviceRevokeInputSchema", () => {
      const valid = deviceRevokeInputSchema.safeParse({
        deviceId: "device-123",
        revocationReason: "Dispositivo reportado como robado",
        revokedBy: "user-admin-global",
      });
      expect(valid.success).toBe(true);
    });

    it("validates deviceSchema with active and revoked states", () => {
      const validActive = deviceSchema.safeParse({
        id: "dev-001",
        organizationId: "org-demo-001",
        deviceFingerprint: "fp-001",
        assignedUserId: "usr-001",
        status: "active",
        createdAt: "2026-09-20T00:00:00.000Z",
      });
      expect(validActive.success).toBe(true);

      const validRevoked = deviceSchema.safeParse({
        id: "dev-002",
        organizationId: "org-demo-001",
        deviceFingerprint: "fp-002",
        assignedUserId: "usr-001",
        status: "revoked",
        revokedAt: "2026-09-20T12:00:00.000Z",
        revokedBy: "admin-001",
        revocationReason: "Perdido",
        createdAt: "2026-09-20T00:00:00.000Z",
      });
      expect(validRevoked.success).toBe(true);
    });
  });
});
