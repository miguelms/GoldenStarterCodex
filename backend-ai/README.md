# Microservicio Satélite de IA — Python + Flask + Celery

> Componente satélite de Inteligencia Artificial para **Golden Starter V3** bajo el patrón **Backend for Frontend (BFF)**.

Este servicio se ejecuta de forma aislada dentro de la red interna de Docker (`internal-network`) y **no tiene puertos expuestos hacia el exterior**.

---

## 🏛️ Reglas Arquitectónicas Inviolables

1. **Aislamiento Estricto de Base de Datos:**
   - Este microservicio **TIENE ESTRICTAMENTE PROHIBIDO** conectarse a PostgreSQL o importar librerías de base de datos (`psycopg2`, `SQLAlchemy`, etc.).
   - Todo el acceso a la base de datos se canaliza a través de Next.js mediante Drizzle ORM.
2. **Transferencia de Medios Segura:**
   - Next.js sube los archivos directamente a AWS S3 (o almacenamiento local seguro).
   - A este microservicio solo se le envían las claves de objeto (`s3_key` o `s3_keys`) en formato JSON.
3. **Modelos de IA Cloud:**
   - Solo se permite el uso de SDKs oficiales en la nube (OpenAI Whisper / GPT o Google Gemini). Queda prohibido el uso o configuración de modelos locales pesados como Ollama.

---

## 📡 Endpoints Disponibles

| Endpoint | Método | Tipo | Descripción |
| :--- | :--- | :--- | :--- |
| `/api/v1/health` | `GET` | Síncrono | Liveness probe para Docker y el orquestador Next.js. |
| `/api/v1/images/process` | `POST` | Síncrono (< 5s) | Recibe `{ "s3_keys": string[] }` y extrae dimensiones y metadatos. |
| `/api/v1/voice/transcribe` | `POST` | Asíncrono (> 5s) | Encola la transcripción y extracción estructurada en Celery. Retorna `{ "task_id", "status": "queued" }`. |
| `/api/v1/tasks/<task_id>` | `GET` | Síncrono | Consulta el estado y resultado de una tarea en Celery/Redis. |
| `/process/sync` | `POST` | Síncrono (< 5s) | Procesamiento genérico rápido en memoria. |
| `/process/async` | `POST` | Asíncrono (> 5s) | Encola tareas pesadas de medios en Celery. |
