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

// =============================================================================
// BFF PATTERN — AI SATELLITE CONTRACTS (Next.js <-> Flask)
// =============================================================================
// Strict contracts between Next.js (BFF Orchestrator) and Flask (AI Satellite).
// Media files are NEVER sent directly; only the S3 Object Key is passed.
// =============================================================================

export const aiTaskStatusSchema = z.enum([
  "pending",
  "processing",
  "completed",
  "failed",
]);

export const aiSyncProcessRequestSchema = z.object({
  s3Key: z.string().min(1),
  operation: z.string().min(1),
  parameters: z.record(z.string(), z.unknown()).optional(),
});

export const aiSyncProcessResponseSchema = z.object({
  success: z.boolean(),
  operation: z.string(),
  result: z.record(z.string(), z.unknown()),
  executionTimeMs: z.number().optional(),
});

export const aiAsyncProcessRequestSchema = z.object({
  s3Key: z.string().min(1),
  operation: z.string().min(1),
  webhookUrl: z.string().url().optional(),
  parameters: z.record(z.string(), z.unknown()).optional(),
});

export const aiAsyncEnqueueResponseSchema = z.object({
  taskId: z.string().min(1),
  status: aiTaskStatusSchema.default("pending"),
  enqueuedAt: z.string().datetime().optional(),
});

export const aiAsyncTaskDetailSchema = z.object({
  taskId: z.string().min(1),
  status: aiTaskStatusSchema,
  progress: z.number().min(0).max(100).optional(),
  result: z.record(z.string(), z.unknown()).nullable().optional(),
  error: z.string().nullable().optional(),
  createdAt: z.string().datetime().optional(),
  completedAt: z.string().datetime().nullable().optional(),
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

// =============================================================================
// CIP — CAPTADOR INTELIGENTE DE PROPIEDADES CONTRACTS
// =============================================================================
export const propertyTypeSchema = z.enum(["casa", "departamento", "terreno", "comercial"]);
export const currencySchema = z.enum(["MXN", "USD"]);

export const propertyCreateSchema = z.object({
  title: z.string().trim().min(3, "El título debe tener al menos 3 caracteres"),
  property_type: propertyTypeSchema,
  price: z.coerce.number().positive("El precio debe ser un número mayor a cero"),
  currency: currencySchema.default("MXN"),
  address: z.string().trim().min(3, "La dirección debe tener al menos 3 caracteres"),
  GPS_Loc: z.string().trim().optional().default(""),
  land_size: z.coerce.number().nonnegative().optional().nullable(),
  construction_size: z.coerce.number().nonnegative().optional().nullable(),
  bedrooms: z.coerce.number().int().nonnegative().optional().nullable(),
  bathrooms: z.coerce.number().nonnegative().optional().nullable(),
  parking_spots: z.coerce.number().int().nonnegative().optional().nullable(),
  finishes: z.string().trim().optional().nullable(),
  description: z.string().trim().min(5, "La descripción debe tener al menos 5 caracteres"),
  raw_audio_s3_key: z.string().trim().optional().nullable(),
  transcription: z.string().trim().optional().nullable(),
  images: z.array(z.string()).default([]),
});

export const propertySchema = propertyCreateSchema.extend({
  id: z.string().uuid(),
  organizationId: z.string().min(1),
  userId: z.string().min(1).optional().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Voice Extraction Output Schema (from Flask/Celery)
export const voiceExtractionOutputSchema = z.object({
  title: z.string().optional(),
  property_type: propertyTypeSchema.optional(),
  price: z.number().optional(),
  currency: currencySchema.optional(),
  address: z.string().optional(),
  GPS_Loc: z.string().optional(),
  land_size: z.number().optional(),
  construction_size: z.number().optional(),
  bedrooms: z.number().optional(),
  bathrooms: z.number().optional(),
  parking_spots: z.number().optional(),
  finishes: z.string().optional(),
  description: z.string().optional(),
  transcription: z.string().optional(),
});

// Image Batch Processing Request/Response
export const imageProcessBatchRequestSchema = z.object({
  s3_keys: z.array(z.string().min(1)).min(1, "Debe enviar al menos una s3_key"),
});

export const imageMetadataItemSchema = z.object({
  s3_key: z.string(),
  width: z.number().optional(),
  height: z.number().optional(),
  format: z.string().optional(),
  sizeBytes: z.number().optional(),
  status: z.enum(["processed", "failed"]).default("processed"),
});

export const imageProcessBatchResponseSchema = z.object({
  success: z.boolean(),
  processedCount: z.number(),
  images: z.array(imageMetadataItemSchema),
});

/**
 * Normaliza los datos extraídos por IA para asegurar tipos correctos y compatibilidad con el formulario.
 */
export function normalizeVoiceData(raw: unknown): Partial<z.infer<typeof propertyCreateSchema>> {
  if (!raw || typeof raw !== "object") return {};
  const obj = raw as Record<string, unknown>;
  const normalized: Partial<z.infer<typeof propertyCreateSchema>> = {};

  if (typeof obj.title === "string" && obj.title.trim().length >= 3) {
    normalized.title = obj.title.trim();
  }

  if (typeof obj.property_type === "string") {
    const pt = obj.property_type.toLowerCase().trim();
    if (["casa", "departamento", "terreno", "comercial"].includes(pt)) {
      normalized.property_type = pt as z.infer<typeof propertyTypeSchema>;
    }
  }

  if (obj.price !== undefined && obj.price !== null && !isNaN(Number(obj.price)) && Number(obj.price) > 0) {
    normalized.price = Number(obj.price);
  }

  if (typeof obj.currency === "string") {
    const cur = obj.currency.toUpperCase().trim();
    if (cur === "MXN" || cur === "USD") {
      normalized.currency = cur;
    }
  }

  if (typeof obj.address === "string" && obj.address.trim().length >= 3) {
    normalized.address = obj.address.trim();
  }

  if (typeof obj.GPS_Loc === "string" && obj.GPS_Loc.trim()) {
    normalized.GPS_Loc = obj.GPS_Loc.trim();
  }

  if (obj.land_size !== undefined && obj.land_size !== null && !isNaN(Number(obj.land_size))) {
    normalized.land_size = Number(obj.land_size);
  }

  if (obj.construction_size !== undefined && obj.construction_size !== null && !isNaN(Number(obj.construction_size))) {
    normalized.construction_size = Number(obj.construction_size);
  }

  if (obj.bedrooms !== undefined && obj.bedrooms !== null && !isNaN(Number(obj.bedrooms))) {
    normalized.bedrooms = Math.round(Number(obj.bedrooms));
  }

  if (obj.bathrooms !== undefined && obj.bathrooms !== null && !isNaN(Number(obj.bathrooms))) {
    normalized.bathrooms = Number(obj.bathrooms);
  }

  if (obj.parking_spots !== undefined && obj.parking_spots !== null && !isNaN(Number(obj.parking_spots))) {
    normalized.parking_spots = Math.round(Number(obj.parking_spots));
  }

  if (typeof obj.finishes === "string" && obj.finishes.trim()) {
    normalized.finishes = obj.finishes.trim();
  }

  if (typeof obj.description === "string" && obj.description.trim().length >= 5) {
    normalized.description = obj.description.trim();
  }

  if (typeof obj.transcription === "string" && obj.transcription.trim()) {
    normalized.transcription = obj.transcription.trim();
  }

  return normalized;
}

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
export type AiTaskStatus = z.infer<typeof aiTaskStatusSchema>;
export type AiSyncProcessRequest = z.infer<typeof aiSyncProcessRequestSchema>;
export type AiSyncProcessResponse = z.infer<typeof aiSyncProcessResponseSchema>;
export type AiAsyncProcessRequest = z.infer<typeof aiAsyncProcessRequestSchema>;
export type AiAsyncEnqueueResponse = z.infer<typeof aiAsyncEnqueueResponseSchema>;
export type AiAsyncTaskDetail = z.infer<typeof aiAsyncTaskDetailSchema>;
export type ApiErrorResponse = z.infer<typeof apiErrorResponseSchema>;
export type HealthResponse = z.infer<typeof healthSchema>;
export type PropertyType = z.infer<typeof propertyTypeSchema>;
export type Currency = z.infer<typeof currencySchema>;
export type PropertyCreateInput = z.infer<typeof propertyCreateSchema>;
export type Property = z.infer<typeof propertySchema>;
export type VoiceExtractionOutput = z.infer<typeof voiceExtractionOutputSchema>;
export type ImageProcessBatchRequest = z.infer<typeof imageProcessBatchRequestSchema>;
export type ImageMetadataItem = z.infer<typeof imageMetadataItemSchema>;
export type ImageProcessBatchResponse = z.infer<typeof imageProcessBatchResponseSchema>;
