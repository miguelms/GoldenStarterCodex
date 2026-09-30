import { describe, expect, it, vi, beforeEach } from "vitest";

// Mock para server-only en tests unitarios de Vitest
vi.mock("server-only", () => ({}));

import { AiSatelliteClient } from "@/server/ai-satellite-client";

describe("AiSatelliteClient — Golden Starter V3 Satellite Operations", () => {
  let client: AiSatelliteClient;
  const mockBaseUrl = "http://internal-flask:5000";

  beforeEach(() => {
    client = new AiSatelliteClient(mockBaseUrl);
    vi.restoreAllMocks();
  });

  it("llama a /api/v1/voice/transcribe enviando únicamente la s3_key", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        task_id: "task-gsv3-12345",
        status: "queued",
        enqueued_at: "2026-09-30T12:00:00Z",
      }),
    });
    global.fetch = mockFetch;

    const result = await client.transcribeAudio("uploads/audios/test-audio.m4a");

    expect(mockFetch).toHaveBeenCalledWith(
      "http://internal-flask:5000/api/v1/voice/transcribe",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ s3_key: "uploads/audios/test-audio.m4a" }),
      })
    );
    expect(result.task_id).toBe("task-gsv3-12345");
    expect(result.status).toBe("queued");
  });

  it("obtiene el estado de la tarea desde /api/v1/tasks/<task_id>", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        task_id: "task-gsv3-12345",
        status: "success",
        ready: true,
        progress: 100,
        result: {
          summary: "Audio procesado exitosamente",
          transcription: "Texto transcrito de prueba...",
        },
      }),
    });
    global.fetch = mockFetch;

    const result = await client.getTaskStatus("task-gsv3-12345");

    expect(mockFetch).toHaveBeenCalledWith(
      "http://internal-flask:5000/api/v1/tasks/task-gsv3-12345",
      expect.objectContaining({ method: "GET" })
    );
    expect(result.status).toBe("success");
    expect(result.ready).toBe(true);
    expect(result.result?.summary).toBe("Audio procesado exitosamente");
  });

  it("procesa imágenes de forma síncrona en /api/v1/images/process", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        processed_count: 2,
        images: [
          { s3_key: "img1.jpg", width: 1920, height: 1080, format: "JPEG", status: "processed" },
          { s3_key: "img2.jpg", width: 1920, height: 1080, format: "JPEG", status: "processed" },
        ],
      }),
    });
    global.fetch = mockFetch;

    const result = await client.processImages(["img1.jpg", "img2.jpg"]);

    expect(mockFetch).toHaveBeenCalledWith(
      "http://internal-flask:5000/api/v1/images/process",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ s3_keys: ["img1.jpg", "img2.jpg"] }),
      })
    );
    expect(result.success).toBe(true);
    expect(result.processed_count).toBe(2);
    expect(result.images).toHaveLength(2);
  });
});
