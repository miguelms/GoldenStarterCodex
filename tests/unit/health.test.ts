import { describe, expect, it } from "vitest";
import { healthPayload } from "@/lib/health";

describe("healthPayload", () => {
  it("returns a verifiable service status", () => {
    const payload = healthPayload();
    expect(payload.service).toBe("golden-starter-web");
    expect(payload.status).toBe("ok");
    expect(payload.version).toBe("2.0.0");
    expect(payload.timestamp).toBeDefined();
  });
});
