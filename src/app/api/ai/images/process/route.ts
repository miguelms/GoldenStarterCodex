import { NextResponse } from "next/server";
import { z } from "zod";
import { aiSatelliteClient } from "@/server/ai-satellite-client";
import { getRequestContext } from "@/server/auth";

const imageProcessSchema = z.object({
  s3_keys: z.array(z.string().min(1)).min(1, "Debe incluir al menos una s3_key"),
});

export async function POST(request: Request) {
  const context = getRequestContext(request);

  try {
    const body = await request.json().catch(() => ({}));
    const parsed = imageProcessSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          code: "VALIDATION_ERROR",
          message: "Formato de petición inválido",
          errors: parsed.error.flatten(),
          requestId: context.requestId,
        },
        { status: 400 }
      );
    }

    // Llamada síncrona (< 5 segundos) a Flask para extraer dimensiones y metadatos
    const result = await aiSatelliteClient.processImages(parsed.data.s3_keys);

    return NextResponse.json(
      {
        success: true,
        processed_count: result.processed_count,
        images: result.images,
        execution_time_ms: result.execution_time_ms,
        requestId: context.requestId,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al procesar imágenes en satélite IA";
    return NextResponse.json(
      {
        code: "IMAGE_PROCESS_FAILED",
        message,
        requestId: context.requestId,
      },
      { status: 502 }
    );
  }
}
