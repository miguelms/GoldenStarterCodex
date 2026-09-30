import { NextResponse } from "next/server";
import { z } from "zod";
import { aiSatelliteClient } from "@/server/ai-satellite-client";
import { getRequestContext } from "@/server/auth";

const transcribeRequestSchema = z.object({
  s3_key: z.string().min(1, "s3_key es requerido"),
});

export async function POST(request: Request) {
  const context = getRequestContext(request);

  try {
    const body = await request.json().catch(() => ({}));
    const parsed = transcribeRequestSchema.safeParse(body);

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

    // Llamada interna HTTP al microservicio satélite Flask (en red Docker interna)
    // Regla estricta: solo se envía la clave s3_key
    const result = await aiSatelliteClient.transcribeVoice(parsed.data.s3_key);

    return NextResponse.json(
      {
        success: true,
        task_id: result.task_id,
        status: result.status,
        enqueued_at: result.enqueued_at,
        requestId: context.requestId,
      },
      { status: 202 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al encolar transcripción de voz";
    return NextResponse.json(
      {
        code: "AI_SATELLITE_ERROR",
        message,
        requestId: context.requestId,
      },
      { status: 502 }
    );
  }
}
