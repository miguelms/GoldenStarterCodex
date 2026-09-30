import os
import time
from datetime import datetime, timezone
from flask import Flask, jsonify, request
from dotenv import load_dotenv
from celery_app import celery_app
from tasks import process_heavy_media

load_dotenv()

app = Flask(__name__)

@app.route("/health", methods=["GET"])
def health_check():
    """Liveness probe para Docker y el orquestador Next.js."""
    return jsonify({
        "service": "ai-satellite-flask",
        "status": "ok",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }), 200

@app.route("/process/sync", methods=["POST"])
def process_sync():
    """
    Flujos Síncronos (< 5 segundos).
    Para tareas rápidas (ej. extracción de metadatos, validación de imagen rápida).
    Regla estricta: Solo recibe s3Key y parámetros en JSON.
    """
    start_time = time.time()
    data = request.get_json(silent=True) or {}
    
    s3_key = data.get("s3Key")
    operation = data.get("operation", "quick_analysis")
    parameters = data.get("parameters", {})

    if not s3_key:
        return jsonify({
            "error": "BAD_REQUEST",
            "message": "s3Key is required in JSON payload"
        }), 400

    # Procesamiento rápido simulado/real en memoria
    result = {
        "s3Key": s3_key,
        "operation": operation,
        "extractedMetadata": {
            "mimeType": "application/octet-stream",
            "detectedLabels": ["real_estate", "property_capture"],
            "orientation": "horizontal",
        },
        "status": "completed",
    }

    elapsed_ms = int((time.time() - start_time) * 1000)

    return jsonify({
        "success": True,
        "operation": operation,
        "result": result,
        "executionTimeMs": elapsed_ms,
    }), 200

@app.route("/process/async", methods=["POST"])
def process_async():
    """
    Flujos Asíncronos (> 5 segundos).
    Para tareas pesadas (ej. transcripción con Whisper, análisis RAG, visión computacional).
    Delega a Celery inmediatamente y devuelve un task_id.
    """
    data = request.get_json(silent=True) or {}
    
    s3_key = data.get("s3Key")
    operation = data.get("operation", "heavy_processing")
    parameters = data.get("parameters", {})

    if not s3_key:
        return jsonify({
            "error": "BAD_REQUEST",
            "message": "s3Key is required in JSON payload"
        }), 400

    # Encolar en Celery
    task = process_heavy_media.delay(s3_key, operation, parameters)

    return jsonify({
        "taskId": task.id,
        "status": "pending",
        "enqueuedAt": datetime.now(timezone.utc).isoformat(),
    }), 202

@app.route("/tasks/<task_id>", methods=["GET"])
def get_task_status(task_id: str):
    """
    Consulta el estado de una tarea asíncrona en Celery/Redis.
    """
    async_result = celery_app.AsyncResult(task_id)
    
    state = async_result.state
    response_data = {
        "taskId": task_id,
        "status": "processing" if state == "PROCESSING" else (
            "completed" if state == "SUCCESS" else (
                "failed" if state == "FAILURE" else "pending"
            )
        ),
        "result": None,
        "error": None,
    }

    if state == "SUCCESS":
        response_data["result"] = async_result.result
        response_data["completedAt"] = datetime.now(timezone.utc).isoformat()
    elif state == "FAILURE":
        response_data["error"] = str(async_result.info)
    elif state == "PROCESSING":
        meta = async_result.info if isinstance(async_result.info, dict) else {}
        response_data["progress"] = meta.get("progress", 50)

    return jsonify(response_data), 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)
