import "server-only";
import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { db } from "../db";
import { errorLogs } from "../db/schema";

const secretPattern =
  /(password|passwd|secret|token|authorization|cookie|api[-_]?key|access[-_]?key|private[-_]?key)/i;

function scrub(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(scrub);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, item]) => [
        key,
        secretPattern.test(key) ? "[REDACTED]" : scrub(item),
      ])
    );
  }
  if (typeof value === "string") {
    return value.replace(
      /(password|token|secret|authorization|api[_-]?key)\s*[:=]\s*[^\s,;]+/gi,
      "$1=[REDACTED]"
    );
  }
  return value;
}

export type ErrorLogInput = {
  orgId?: string | null;
  userId?: string | null;
  userEmail?: string | null;
  severity?: "Error" | "Warning";
  source?: string;
  route?: string;
  message: string;
  stack?: string;
  metadata?: unknown;
};

export async function recordError(input: ErrorLogInput) {
  const timestamp = new Date().toISOString();
  const scrubbedMetadata = input.metadata ? scrub(input.metadata) : null;
  const safeMessage = typeof input.message === "string" ? scrub(input.message) : String(input.message);

  // 1. Asynchronous write to database (if available)
  try {
    await db.insert(errorLogs).values({
      organizationId: input.orgId || undefined,
      userId: input.userId || undefined,
      userEmail: input.userEmail,
      severity: input.severity || "Error",
      source: input.source,
      route: input.route,
      message: safeMessage as string,
      stack: input.stack,
      metadata: scrubbedMetadata,
    });
  } catch {
    // If DB is unreachable, failover to append log file
  }

  // 2. Append to fallback log file
  try {
    const errorDir = path.join(process.cwd(), "storage", "errors");
    await mkdir(errorDir, { recursive: true });
    const logLine = JSON.stringify({
      timestamp,
      severity: input.severity || "Error",
      route: input.route,
      message: safeMessage,
      metadata: scrubbedMetadata,
    }) + "\n";
    await appendFile(path.join(errorDir, "system-errors.log"), logLine, "utf-8");
  } catch {
    // Fail silently to avoid cascading crashes
  }
}
