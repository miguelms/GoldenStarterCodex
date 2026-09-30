import { z } from "zod";

// =============================================================================
// GOLDEN STARTER V2 — CORE CANONICAL CONTRACTS
// =============================================================================
// Pure Zod schemas shared across Web (Next.js 16) and Mobile (Expo 57 / React Native).
// Domain-agnostic, strictly typed, zero circular dependencies.
// =============================================================================

// Common Schemas
export const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD");
export const uuidSchema = z.string().uuid();

export const roleSchema = z.enum([
  "admin_global",
  "org_admin",
  "manager",
  "member",
  "viewer",
]);

// Organization & User Contracts
export const organizationSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1).optional(),
  createdAt: z.string().datetime().optional(),
});

export const userProfileSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  email: z.string().email(),
  displayName: z.string().min(1),
  role: roleSchema,
  avatarUrl: z.string().url().nullable().optional(),
  createdAt: z.string().datetime().optional(),
});

// Device Management Contracts
export const deviceStatusSchema = z.enum(["active", "revoked"]);

export const deviceSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  deviceFingerprint: z.string().min(1),
  assignedUserId: z.string().min(1),
  status: deviceStatusSchema.default("active"),
  revokedAt: z.string().datetime().nullable().optional(),
  revokedBy: z.string().min(1).nullable().optional(),
  revocationReason: z.string().nullable().optional(),
  createdAt: z.string().datetime(),
});

export const deviceRevokeInputSchema = z.object({
  deviceId: z.string().min(1).optional(),
  revocationReason: z.string().min(1).optional(),
  revokedBy: z.string().min(1).optional(),
});

// Offline Sync Queue Contracts (Idempotent Outbox)
export const syncEventStatusSchema = z.enum(["accepted", "review_required"]);

export const syncEventSchema = z.object({
  clientEventId: z.string().min(8),
  deviceId: z.string().min(1).optional(),
  type: z.string().min(1),
  status: syncEventStatusSchema.default("accepted"),
  occurredAt: z.string().datetime(),
  payload: z.record(z.string(), z.unknown()),
});

export const quarantineSyncEventSchema = syncEventSchema.extend({
  status: z.literal("review_required"),
  quarantineReason: z.string().min(1).optional(),
  quarantinedAt: z.string().datetime().optional(),
});

export const syncBatchInputSchema = z.union([
  syncEventSchema,
  z.array(syncEventSchema),
  z.object({ events: z.array(syncEventSchema) }),
]);

export const processedSyncEventSchema = syncEventSchema.extend({
  quarantineReason: z.string().optional(),
});

// Audit Log Contracts (Append-Only)
export const auditActionSchema = z.enum([
  "create",
  "update",
  "archive",
  "revoke",
  "sync",
  "login",
  "export",
]);

export const auditLogSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  userId: z.string().min(1),
  action: auditActionSchema,
  entityType: z.string().min(1),
  entityId: z.string().min(1),
  metadata: z.record(z.string(), z.unknown()).optional(),
  createdAt: z.string().datetime(),
});

// Storage Contracts
export const storageProviderSchema = z.enum(["local", "s3"]);

export const storageObjectSchema = z.object({
  key: z.string().min(1),
  provider: storageProviderSchema,
  contentType: z.string().min(1),
  sizeBytes: z.number().int().nonnegative().optional(),
  url: z.string().url().optional(),
});

// Standard API Response Contracts
export const apiErrorResponseSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.unknown().optional(),
  requestId: z.string(),
});

export const apiSuccessResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
    requestId: z.string().optional(),
  });

export const paginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    totalCount: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    pageSize: z.number().int().positive(),
    hasMore: z.boolean(),
  });

export const healthSchema = z.object({
  status: z.enum(["healthy", "degraded", "unhealthy"]),
  timestamp: z.string().datetime(),
  version: z.string(),
  uptime: z.number().nonnegative(),
  services: z.record(z.string(), z.object({
    status: z.enum(["up", "down"]),
    latencyMs: z.number().optional(),
    details: z.string().optional(),
  })),
});

// TypeScript Types Derived from Zod Schemas
export type Role = z.infer<typeof roleSchema>;
export type Organization = z.infer<typeof organizationSchema>;
export type UserProfile = z.infer<typeof userProfileSchema>;
export type DeviceStatus = z.infer<typeof deviceStatusSchema>;
export type Device = z.infer<typeof deviceSchema>;
export type DeviceRevokeInput = z.infer<typeof deviceRevokeInputSchema>;
export type SyncEventStatus = z.infer<typeof syncEventStatusSchema>;
export type SyncEvent = z.infer<typeof syncEventSchema>;
export type QuarantineSyncEvent = z.infer<typeof quarantineSyncEventSchema>;
export type SyncBatchInput = z.infer<typeof syncBatchInputSchema>;
export type ProcessedSyncEvent = z.infer<typeof processedSyncEventSchema>;
export type AuditAction = z.infer<typeof auditActionSchema>;
export type AuditLog = z.infer<typeof auditLogSchema>;
export type StorageProvider = z.infer<typeof storageProviderSchema>;
export type StorageObject = z.infer<typeof storageObjectSchema>;
export type ApiErrorResponse = z.infer<typeof apiErrorResponseSchema>;
export type HealthResponse = z.infer<typeof healthSchema>;
