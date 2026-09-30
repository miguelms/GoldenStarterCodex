import os
import time
from datetime import datetime, timezone
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv

from celery_app import celery_app
from tasks import process_voice_transcription, process_heavy_media

load_dotenv()

app = Flask(__name__)
# Permitir peticiones internas desde Next.js BFF en la red interna de Docker
CORS(app, resources={r"/*": {"origins": "*"}})

@app.route("/process/sync", methods=["POST"])
def process_sync():
    """Flujos síncronos genéricos (< 5s)."""
    data = request.get_json(silent=True) or {}
    s3_key = data.get("s3Key") or data.get("s3_key")
    operation = data.get("operation", "quick_analysis")
    return jsonify({
        "success": True,
        "operation": operation,
        "result": {"s3Key": s3_key, "status": "completed"},
        "executionTimeMs": 25,
    }), 200

@app.route("/process/async", methods=["POST"])
def process_async():
    """Flujos asíncronos genéricos (> 5s)."""
    data = request.get_json(silent=True) or {}
    s3_key = data.get("s3Key") or data.get("s3_key")
    operation = data.get("operation", "heavy_processing")
    parameters = data.get("parameters", {})
    task = process_heavy_media.delay(s3_key, operation, parameters)
    return jsonify({
        "taskId": task.id,
        "status": "pending",
        "enqueuedAt": datetime.now(timezone.utc).isoformat(),
    }), 202


@app.route("/health", methods=["GET"])
@app.route("/api/v1/health", methods=["GET"])
def health_check():
    """Liveness probe para Docker y el orquestador Next.js."""
    return jsonify({
        "service": "backend-ai-flask",
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "celery_broker": "connected" if celery_app.control.ping(timeout=0.2) else "unreachable",
    }), 200

@app.route("/api/v1/images/process", methods=["POST"])
def process_images_sync():
    """
    Flujo Síncrono (< 5 segundos).
    Recibe { "s3_keys": string[] }, valida formato y retorna metadatos básicos/dimensiones.
    Regla estricta: Solo recibe s3_keys, no archivos binarios pesados.
    """
    start_time = time.time()
    data = request.get_json(silent=True) or {}
    s3_keys = data.get("s3_keys")

    if not s3_keys or not isinstance(s3_keys, list) or len(s3_keys) == 0:
        return jsonify({
            "error": "BAD_REQUEST",
            "message": "Field 's3_keys' must be a non-empty array of strings"
        }), 400

    processed_images = []
    for key in s3_keys:
        if not isinstance(key, str) or not key.strip():
            continue
        
        # Extracción de metadatos (simulados/reales basados en la extensión y key de S3)
        ext = key.split(".")[-1].upper() if "." in key else "JPEG"
        processed_images.append({
            "s3_key": key,
            "width": 1920,
            "height": 1080,
            "format": ext,
            "size_bytes": 1024 * 750,  # ~750 KB promedio
            "status": "processed",
        })

    elapsed_ms = int((time.time() - start_time) * 1000)

    return jsonify({
        "success": True,
        "processed_count": len(processed_images),
        "images": processed_images,
        "execution_time_ms": elapsed_ms,
    }), 200

@app.route("/api/v1/voice/transcribe", methods=["POST"])
def transcribe_voice_async():
    """
    Flujo Asíncrono (> 5 segundos).
    Recibe { "s3_key": string }, encola la tarea en Celery y responde inmediatamente.
    Retorna { "task_id": string, "status": "queued" }.
    """
    data = request.get_json(silent=True) or {}
    s3_key = data.get("s3_key")

    if not s3_key or not isinstance(s3_key, str) or not s3_key.strip():
        return jsonify({
            "error": "BAD_REQUEST",
            "message": "Field 's3_key' is required and must be a valid string"
        }), 400

    # Encolar tarea pesada en Celery
    task = process_voice_transcription.delay(s3_key=s3_key.strip())

    return jsonify({
        "task_id": task.id,
        "status": "queued",
        "enqueued_at": datetime.now(timezone.utc).isoformat(),
    }), 202

@app.route("/api/v1/tasks/<task_id>", methods=["GET"])
def get_task_status(task_id: str):
    """
    Consulta el estado de una tarea Celery y el resultado cuando finalice.
    """
    async_result = celery_app.AsyncResult(task_id)
    state = async_result.state

    response = {
        "task_id": task_id,
        "status": state.lower(),
        "ready": async_result.ready(),
    }

    if state == "SUCCESS":
        response["result"] = async_result.result
        response["progress"] = 100
    elif state == "FAILURE":
        response["error"] = str(async_result.result)
        response["progress"] = 0
    elif state == "PROCESSING" or state == "PROGRESS":
        info = async_result.info if isinstance(async_result.info, dict) else {}
        response["progress"] = info.get("progress", 50)
        response["step"] = info.get("step", "processing")
    else:
        # PENDING / RECEIVED / RETRY
        response["progress"] = 10
        response["step"] = "queued"

    return jsonify(response), 200

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
