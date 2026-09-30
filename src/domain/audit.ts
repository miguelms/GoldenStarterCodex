export type AuditEntry = {
  id: string;
  kind: string;
  payload: Record<string, unknown>;
  recordedAt: string;
};

export type Addendum = {
  id: string;
  entryId: string;
  reason: string;
  payload: Record<string, unknown>;
  createdAt: string;
  createdBy: string;
};

export function createAddendum(entry: { id: string }, input: Omit<Addendum, "entryId">): Addendum {
  return { ...input, entryId: entry.id };
}
