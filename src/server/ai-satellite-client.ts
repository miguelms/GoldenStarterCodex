import "server-only";
import {
  aiAsyncEnqueueResponseSchema,
  aiAsyncTaskDetailSchema,
  aiSyncProcessResponseSchema,
  type AiAsyncEnqueueResponse,
  type AiAsyncTaskDetail,
  type AiSyncProcessRequest,
  type AiSyncProcessResponse,
  type ImageMetadataItem,
} from "@starter/contracts";
import { getFlaskApiUrl } from "@/lib/server-env";

export interface CipVoiceTranscribeResponse {
  task_id: string;
  status: string;
  enqueued_at?: string;
}

export interface CipTaskStatusResponse {
  task_id: string;
  status: string;
  ready: boolean;
  progress?: number;
  step?: string;
  result?: Record<string, unknown>;
  error?: string;
}

export interface CipImageProcessResponse {
  success: boolean;
  processed_count: number;
  images: ImageMetadataItem[];
  execution_time_ms?: number;
}

export class AiSatelliteClient {
  private readonly baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = (baseUrl || getFlaskApiUrl()).replace(/\/+$/, "");
  }

  /**
   * Dispara la transcripción y extracción estructurada por voz en Flask/Celery.
   * Regla de arquitectura: solo envía s3_key, no archivos pesados por HTTP.
   */
  public async transcribeVoice(s3Key: string): Promise<CipVoiceTranscribeResponse> {
    const response = await fetch(`${this.baseUrl}/api/v1/voice/transcribe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Caller": "Nextjs-BFF",
      },
      body: JSON.stringify({ s3_key: s3Key }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(`AI Satellite voice transcription failed with HTTP ${response.status}: ${errorText}`);
    }

    return (await response.json()) as CipVoiceTranscribeResponse;
  }

  /**
   * Consulta el estado de una tarea Celery en Flask.
   */
  public async getCipTaskStatus(taskId: string): Promise<CipTaskStatusResponse> {
    const response = await fetch(`${this.baseUrl}/api/v1/tasks/${encodeURIComponent(taskId)}`, {
      method: "GET",
      headers: {
        "X-Caller": "Nextjs-BFF",
      },
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(`Failed to retrieve task status for ${taskId} (HTTP ${response.status}): ${errorText}`);
    }

    return (await response.json()) as CipTaskStatusResponse;
  }

  /**
   * Procesa imágenes de forma síncrona en Flask (< 5 segundos).
   * Envía un arreglo de s3_keys y retorna metadatos / dimensiones.
   */
  public async processImages(s3Keys: string[]): Promise<CipImageProcessResponse> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    try {
      const response = await fetch(`${this.baseUrl}/api/v1/images/process`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Caller": "Nextjs-BFF",
        },
        body: JSON.stringify({ s3_keys: s3Keys }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        throw new Error(`AI Satellite image processing failed with HTTP ${response.status}: ${errorText}`);
      }

      return (await response.json()) as CipImageProcessResponse;
    } catch (err: unknown) {
      if ((err as { name?: string }).name === "AbortError") {
        throw new Error("AI Satellite image processing timeout: exceeded 5 seconds limit");
      }
      throw err;
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Procesa una tarea genérica síncrona en el microservicio satélite Flask (< 5 segundos).
   */
  public async processSync(payload: AiSyncProcessRequest): Promise<AiSyncProcessResponse> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

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
   * Encola una tarea genérica asíncrona en Flask/Celery (> 5 segundos).
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
   * Consulta el estado de una tarea genérica en curso en Celery/Redis a través de Flask.
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
  ): Promise<CipTaskStatusResponse> {
    const maxAttempts = options.maxAttempts ?? 30;
    const intervalMs = options.intervalMs ?? 1500;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const detail = await this.getCipTaskStatus(taskId);
      if (detail.status === "success" || detail.status === "failure") {
        return detail;
      }
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }

    throw new Error(`AI Satellite task ${taskId} polling timed out after ${maxAttempts} attempts`);
  }
}

export const aiSatelliteClient = new AiSatelliteClient();
