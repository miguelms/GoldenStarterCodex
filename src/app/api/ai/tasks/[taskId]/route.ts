import { NextResponse } from "next/server";
import { aiSatelliteClient } from "@/server/ai-satellite-client";
import { normalizeVoiceData } from "@starter/contracts";
import { getRequestContext } from "@/server/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const context = getRequestContext(request);
  const { taskId } = await params;

  if (!taskId) {
    return NextResponse.json(
      {
        code: "TASK_ID_REQUIRED",
        message: "taskId parameter is required",
        requestId: context.requestId,
      },
      { status: 400 }
    );
  }

  try {
    const taskStatus = await aiSatelliteClient.getCipTaskStatus(taskId);

    // Si la tarea terminó con éxito, incluir los datos normalizados para el formulario
    let normalizedData = null;
    if (taskStatus.status === "success" && taskStatus.result) {
      normalizedData = normalizeVoiceData(taskStatus.result);
    }

    return NextResponse.json(
      {
        success: true,
        task_id: taskStatus.task_id,
        status: taskStatus.status,
        ready: taskStatus.ready,
        progress: taskStatus.progress ?? (taskStatus.ready ? 100 : 50),
        step: taskStatus.step,
        result: taskStatus.result,
        normalized: normalizedData,
        error: taskStatus.error,
        requestId: context.requestId,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al consultar estado de tarea";
    return NextResponse.json(
      {
        code: "TASK_QUERY_FAILED",
        message,
        requestId: context.requestId,
      },
      { status: 502 }
    );
  }
}
