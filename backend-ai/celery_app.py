import os
from celery import Celery
from dotenv import load_dotenv

load_dotenv()

redis_url = os.getenv("CELERY_BROKER_URL") or os.getenv("REDIS_URL", "redis://redis:6379/0")
result_backend = os.getenv("CELERY_RESULT_BACKEND") or redis_url

celery_app = Celery(
    "ai_satellite",
    broker=redis_url,
    backend=result_backend,
    include=["tasks"],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=300,  # 5 minutos límite máximo para tareas pesadas
)
