import { NextResponse } from "next/server";
import { z } from "zod";
import { putObject } from "@/lib/storage";
import { getRequestContext } from "@/server/auth";

const ALLOWED_MIME_TYPES = [
  // Audios
  "audio/m4a",
  "audio/x-m4a",
  "audio/mp3",
  "audio/mpeg",
  "audio/wav",
  "audio/wave",
  "audio/x-wav",
  "audio/webm",
  "audio/ogg",
  // Imágenes
  "image/jpeg",
  "image/png",
  "image/webp",
];

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

export async function POST(request: Request) {
  try {
    const context = getRequestContext(request);
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const category = (formData.get("category") as string) || "general";

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        {
          code: "FILE_REQUIRED",
          message: "No se proporcionó ningún archivo en el campo 'file'",
          requestId: context.requestId,
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        {
          code: "FILE_TOO_LARGE",
          message: "El archivo excede el tamaño máximo permitido de 50MB",
          requestId: context.requestId,
        },
        { status: 400 }
      );
    }

    // Normalizar extensión
    const originalName = file.name || "media.bin";
    const extension = originalName.includes(".")
      ? originalName.split(".").pop()?.toLowerCase() || "bin"
      : "bin";

    const isAudio = file.type.startsWith("audio/") || ["m4a", "mp3", "wav", "webm", "ogg"].includes(extension);
    const folder = isAudio ? "audios" : "images";
    const safeTimestamp = Date.now();
    const uniqueId = crypto.randomUUID().slice(0, 8);
    const s3Key = `properties/${folder}/${safeTimestamp}-${uniqueId}.${extension}`;

    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    const stored = await putObject(s3Key, uint8Array, file.type || "application/octet-stream");

    return NextResponse.json(
      {
        success: true,
        s3Key: stored.key,
        fileName: originalName,
        contentType: stored.contentType,
        sizeBytes: file.size,
        provider: stored.provider,
        category,
        requestId: context.requestId,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error inesperado al subir archivo";
    return NextResponse.json(
      {
        code: "UPLOAD_FAILED",
        message,
        requestId: crypto.randomUUID(),
      },
      { status: 500 }
    );
  }
}
