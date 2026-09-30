import { describe, expect, it } from "vitest";

import { acceptIdempotentEvent, type SyncRecord, type SyncStore } from "@/domain/sync";

function memoryStore(): SyncStore {
  const records = new Map<string, SyncRecord>();
  return {
    find: (clientEventId) => records.get(clientEventId),
    insert: (record) => records.set(record.clientEventId, record),
  };
}

describe("idempotent sync", () => {
  it("returns the same server event for a retry", () => {
    const store = memoryStore();
    const first = acceptIdempotentEvent(store, "event-0001", () => "server-001");
    const retry = acceptIdempotentEvent(store, "event-0001", () => "server-002");

    expect(first.status).toBe("accepted");
    expect(retry).toEqual({ status: "duplicate", record: first.record });
  });
});
