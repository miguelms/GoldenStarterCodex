import { beforeEach, describe, expect, it } from "vitest";
import { GET as getHealth } from "@/app/api/health/route";
import { POST as revokeDevice } from "@/app/api/devices/[id]/revoke/route";
import { GET as getSync, POST as postSync } from "@/app/api/sync/route";
import { getStore } from "@/server/store";

describe("Canonical API Routes (Golden Starter V2)", () => {
  beforeEach(() => {
    getStore().reset();
  });

  describe("GET /api/health", () => {
    it("returns 200 OK with service status", async () => {
      const res = await getHealth();
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.status).toBe("ok");
      expect(data.service).toBe("golden-starter-web");
      expect(data.version).toBe("2.0.0");
    });
  });

  describe("POST /api/devices/[id]/revoke", () => {
    it("revokes active device when requested by admin_global", async () => {
      const req = new Request("http://localhost/api/devices/device-001/revoke", {
        method: "POST",
        headers: {
          "x-organization-id": "org-demo-001",
          "x-user-role": "admin_global",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          revocationReason: "Stolen device reported",
        }),
      });

      const res = await revokeDevice(req, {
        params: Promise.resolve({ id: "device-001" }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.device.status).toBe("revoked");
      expect(data.device.revocationReason).toBe("Stolen device reported");
    });

    it("rejects device revocation for non-admin role with 403 Forbidden", async () => {
      const req = new Request("http://localhost/api/devices/device-001/revoke", {
        method: "POST",
        headers: {
          "x-organization-id": "org-demo-001",
          "x-user-role": "member",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      const res = await revokeDevice(req, {
        params: Promise.resolve({ id: "device-001" }),
      });

      expect(res.status).toBe(403);
      const data = await res.json();
      expect(data.code).toBe("FORBIDDEN");
    });
  });

  describe("POST /api/sync", () => {
    it("accepts incoming events from active devices", async () => {
      const req = new Request("http://localhost/api/sync", {
        method: "POST",
        headers: {
          "x-organization-id": "org-demo-001",
          "x-user-role": "member",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientEventId: "client-evt-001",
          deviceId: "device-001",
          type: "custom_action",
          occurredAt: new Date().toISOString(),
          payload: { foo: "bar" },
        }),
      });

      const res = await postSync(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.processedCount).toBe(1);
      expect(data.quarantinedCount).toBe(0);
    });

    it("quarantines events coming from a revoked device", async () => {
      // First revoke the device
      const store = getStore();
      store.updateDevice("device-001", {
        status: "revoked",
        revocationReason: "Lost device in transit",
      });

      const req = new Request("http://localhost/api/sync", {
        method: "POST",
        headers: {
          "x-organization-id": "org-demo-001",
          "x-user-role": "member",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientEventId: "client-evt-002",
          deviceId: "device-001",
          type: "unauthorized_action",
          occurredAt: new Date().toISOString(),
          payload: { action: "attempt" },
        }),
      });

      const res = await postSync(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.quarantinedCount).toBe(1);
      expect(data.events[0].status).toBe("review_required");
    });
  });
});
