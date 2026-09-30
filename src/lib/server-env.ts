import { z } from "zod";

const databaseUrlSchema = z
  .string()
  .url()
  .refine((value) => value.startsWith("postgresql://") || value.startsWith("postgres://"), {
    message: "DATABASE_URL must use PostgreSQL",
  });

const optionalString = z
  .string()
  .trim()
  .min(1)
  .optional()
  .or(z.literal(""))
  .transform((val) => val || undefined);

const storageEnvSchema = z
  .object({
    STORAGE_PROVIDER: z.enum(["local", "s3"]).default("local"),
    LOCAL_STORAGE_DIR: optionalString,
    AWS_REGION: z.string().trim().min(1).default("us-east-1"),
    S3_BUCKET: optionalString,
    S3_PREFIX: z.string().trim().max(512).optional().default(""),
  })
  .superRefine((val, ctx) => {
    if (val.STORAGE_PROVIDER === "s3" && !val.S3_BUCKET) {
      ctx.addIssue({
        code: "custom",
        path: ["S3_BUCKET"],
        message: "S3_BUCKET is required when STORAGE_PROVIDER=s3",
      });
    }
  });

const authEnvSchema = z.object({
  BETTER_AUTH_SECRET: z.string().min(16).default("dev-secret-key-at-least-16-chars-long"),
  BETTER_AUTH_URL: z.string().url().default("http://localhost:3000"),
});

export function getDatabaseUrl() {
  const parsed = databaseUrlSchema.safeParse(process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/starter_db");
  if (!parsed.success) throw new Error("DATABASE_URL is not configured or invalid");
  return parsed.data;
}

export function getStorageEnv() {
  const parsed = storageEnvSchema.safeParse(process.env);
  if (!parsed.success) throw new Error(`Storage environment is invalid: ${JSON.stringify(parsed.error.flatten())}`);
  return parsed.data;
}

export function getBetterAuthEnv() {
  const parsed = authEnvSchema.safeParse(process.env);
  if (!parsed.success) throw new Error("Better Auth environment is invalid");
  return parsed.data;
}
