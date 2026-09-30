import "server-only";
import {
  aiAsyncEnqueueResponseSchema,
  aiAsyncTaskDetailSchema,
  aiSyncProcessResponseSchema,
  type AiAsyncEnqueueResponse,
  type AiAsyncTaskDetail,
  type AiSyncProcessRequest,
  type AiSyncProcessResponse,
} from "@starter/contracts";

const AI_SATELLITE_URL = process.env.AI_SATELLITE_URL || "http://flask-api:5000";

export class AiSatelliteClient {
  private readonly baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = (baseUrl || AI_SATELLITE_URL).replace(/\/+$/, "");
  }

  /**
   * Procesa una tarea síncrona en el microservicio satélite Flask (< 5 segundos).
   * Envía únicamente el S3 Object Key y parámetros JSON.
   */
  public async processSync(payload: AiSyncProcessRequest): Promise<AiSyncProcessResponse> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000); // 6s timeout guard

    try {
      const response = await fetch(`${this.baseUrl}/process/sync`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Caller": "Nextjs-BFF",
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        throw new Error(
          `AI Satellite sync processing failed with HTTP ${response.status}: ${errorText}`
        );
      }

      const json = await response.json();
      return aiSyncProcessResponseSchema.parse(json);
    } catch (err: unknown) {
      if ((err as { name?: string }).name === "AbortError") {
        throw new Error("AI Satellite sync timeout: task exceeded 5 seconds limit");
      }
      throw err;
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Encola una tarea pesada asíncrona en Flask/Celery (> 5 segundos).
   * Devuelve inmediatamente el task_id sin bloquear el hilo de ejecución.
   */
  public async enqueueAsync(payload: {
    s3Key: string;
    operation: string;
    webhookUrl?: string;
    parameters?: Record<string, unknown>;
  }): Promise<AiAsyncEnqueueResponse> {
    const response = await fetch(`${this.baseUrl}/process/async`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Caller": "Nextjs-BFF",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(
        `AI Satellite async enqueue failed with HTTP ${response.status}: ${errorText}`
      );
    }

    const json = await response.json();
    return aiAsyncEnqueueResponseSchema.parse(json);
  }

  /**
   * Consulta el estado de una tarea en curso en Celery/Redis a través de Flask.
   */
  public async getTaskStatus(taskId: string): Promise<AiAsyncTaskDetail> {
    const response = await fetch(`${this.baseUrl}/tasks/${encodeURIComponent(taskId)}`, {
      method: "GET",
      headers: {
        "X-Caller": "Nextjs-BFF",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to retrieve task status for ${taskId} (HTTP ${response.status})`);
    }

    const json = await response.json();
    return aiAsyncTaskDetailSchema.parse(json);
  }

  /**
   * Helper de polling para esperar el resultado de una tarea asíncrona.
   */
  public async pollTaskResult(
    taskId: string,
    options: { maxAttempts?: number; intervalMs?: number } = {}
  ): Promise<AiAsyncTaskDetail> {
    const maxAttempts = options.maxAttempts ?? 30; // 30 intentos
    const intervalMs = options.intervalMs ?? 1500; // 1.5s entre consultas

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const detail = await this.getTaskStatus(taskId);
      if (detail.status === "completed" || detail.status === "failed") {
        return detail;
      }
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }

    throw new Error(`AI Satellite task ${taskId} polling timed out after ${maxAttempts} attempts`);
  }
}

export const aiSatelliteClient = new AiSatelliteClient();
