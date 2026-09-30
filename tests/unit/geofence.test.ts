import { describe, expect, it } from "vitest";

import { decideGeofence, distanceMeters } from "@/domain/geofence";

describe("geofence domain", () => {
  const home = { latitude: 32.5, longitude: -117.0 };

  it("allows a precise coordinate inside the configured radius", () => {
    const result = decideGeofence(home, home, 10, 75);
    expect(result.status).toBe("allowed");
  });

  it("rejects low accuracy before making a distance decision", () => {
    const result = decideGeofence(home, home, 101, 75);
    expect(result.status).toBe("low_accuracy");
  });

  it("returns a finite distance", () => {
    expect(distanceMeters(home, { latitude: 32.5005, longitude: -117.0 })).toBeGreaterThan(0);
  });
});
