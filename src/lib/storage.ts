import "server-only";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { getStorageEnv } from "./server-env";

export type StorageProvider = "local" | "s3";

function safeKey(key: string) {
  const normalized = key.replace(/^\/+/, "").replaceAll("\\", "/");
  if (!normalized || normalized.split("/").some((part) => part === "..")) {
    throw new Error("INVALID_STORAGE_KEY: directory traversal attempt detected");
  }
  return normalized;
}

function contentTypeFor(key: string) {
  const extension = path.extname(key).toLowerCase();
  switch (extension) {
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".webp":
      return "image/webp";
    case ".svg":
      return "image/svg+xml";
    case ".pdf":
      return "application/pdf";
    case ".json":
      return "application/json";
    default:
      return "application/octet-stream";
  }
}

export function getStorageConfig() {
  const env = getStorageEnv();
  const localRoot = env.LOCAL_STORAGE_DIR || path.join(process.cwd(), "storage", "uploads");
  return {
    provider: env.STORAGE_PROVIDER as StorageProvider,
    bucket: env.S3_BUCKET,
    region: env.AWS_REGION,
    localRoot,
  };
}

export async function putObject(key: string, body: Uint8Array, contentType?: string) {
  const clean = safeKey(key);
  const config = getStorageConfig();
  const mime = contentType || contentTypeFor(clean);

  if (config.provider === "s3") {
    // S3 client lazy dynamic import to keep local dev bundle fast
    const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");
    const s3 = new S3Client({ region: config.region });
    await s3.send(
      new PutObjectCommand({
        Bucket: config.bucket,
        Key: clean,
        Body: body,
        ContentType: mime,
      })
    );
    return { key: clean, provider: "s3" as const, contentType: mime };
  }

  const destination = path.join(config.localRoot, clean);
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, body);
  return { key: clean, provider: "local" as const, contentType: mime };
}

export async function getObject(key: string) {
  const clean = safeKey(key);
  const config = getStorageConfig();

  if (config.provider === "s3") {
    const { S3Client, GetObjectCommand } = await import("@aws-sdk/client-s3");
    const s3 = new S3Client({ region: config.region });
    const result = await s3.send(
      new GetObjectCommand({
        Bucket: config.bucket,
        Key: clean,
      })
    );
    if (!result.Body) throw new Error("STORAGE_OBJECT_NOT_FOUND");
    const bytes = await result.Body.transformToByteArray();
    return {
      body: bytes,
      contentType: result.ContentType || contentTypeFor(clean),
    };
  }

  const filePath = path.join(config.localRoot, clean);
  const body = await readFile(filePath);
  return {
    body,
    contentType: contentTypeFor(clean),
  };
}

export async function deleteObject(key: string) {
  const clean = safeKey(key);
  const config = getStorageConfig();

  if (config.provider === "s3") {
    const { S3Client, DeleteObjectCommand } = await import("@aws-sdk/client-s3");
    const s3 = new S3Client({ region: config.region });
    await s3.send(
      new DeleteObjectCommand({
        Bucket: config.bucket,
        Key: clean,
      })
    );
    return;
  }

  const filePath = path.join(config.localRoot, clean);
  await unlink(filePath).catch(() => undefined);
}
