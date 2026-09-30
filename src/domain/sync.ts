export type SyncRecord = { clientEventId: string; serverEventId: string };

export type SyncStore = {
  find(clientEventId: string): SyncRecord | undefined;
  insert(record: SyncRecord): void;
};

export function acceptIdempotentEvent(
  store: SyncStore,
  clientEventId: string,
  createServerEventId: () => string,
) {
  const existing = store.find(clientEventId);
  if (existing) return { status: "duplicate" as const, record: existing };

  const record = { clientEventId, serverEventId: createServerEventId() };
  store.insert(record);
  return { status: "accepted" as const, record };
}
