import { describe, expect, it } from "vitest";
import { createAddendum, type AuditEntry } from "@/domain/audit";

describe("Append-only audit and immutable entries", () => {
  it("links an addendum to the original entry without mutating the source", () => {
    const entry: AuditEntry = {
      id: "entry-001",
      kind: "system_record",
      payload: { status: "pending" },
      recordedAt: "2026-09-20T15:00:00.000Z",
    };

    const addendum = createAddendum(entry, {
      id: "addendum-001",
      reason: "Correction of typo in record",
      payload: { status: "pending", notes: "verified" },
      createdAt: "2026-09-20T15:05:00.000Z",
      createdBy: "user-demo-001",
    });

    expect(entry.payload.status).toBe("pending");
    expect(addendum.entryId).toBe(entry.id);
    expect(addendum.reason).toBe("Correction of typo in record");
  });
});
