# FEAT-CIP-001: CIP — Captador Inteligente de Propiedades

> Estado: `VERIFIED`  
> Owner: `product-manager-agent` & `orchestrator-agent`  
> Metodología: Spec-Driven Development (SDD) / Patrón Backend for Frontend (BFF)

---

## 1. Visión y Caso de Uso (User Story)

- **Como:** Asesor inmobiliario o captador en campo.
- **Quiero:** Dar de alta propiedades combinando captura manual rápida con dictado de voz inteligente y fotografías optimizadas.
- **Para:** Reducir a menos de 2 minutos el tiempo de captura de una propiedad, eliminando errores de transcripción y garantizando persistencia relacional con medios seguros en la nube.

---

## 2. Especificación de Comportamiento (Given / When / Then)

### Escenario 1: Flujo de Captura Asistida por Voz
- **Given:** El captador se encuentra en `/propiedades/nueva` con el micrófono del navegador habilitado o un archivo `.m4a` grabado en campo.
- **When:** Graba o sube el audio describiendo la propiedad (ej. *"Casa de dos plantas en Paseo de las Lomas, 3 millones ochocientos..."*).
- **Then:**
  1. Next.js sube el binario a S3 vía `/api/upload` y obtiene un `s3Key`.
  2. Next.js notifica a Flask `/api/v1/voice/transcribe` enviando únicamente `{ "s3_key": string }`.
  3. Flask delega la tarea a Celery y retorna inmediatamente `{ "task_id": string, "status": "queued" }`.
  4. El frontend sondea `/api/ai/tasks/[taskId]`, transcribe el audio y extrae entidades tipadas en JSON.
  5. Se autocompletan los campos vacíos del formulario sin sobrescribir valores ingresados manualmente a menos que el usuario lo autorice.

### Escenario 2: Lógica de Fusión y Resolución de Conflictos (Smart Merge)
- **Given:** El usuario ya capturó manualmente el campo Precio como `$4,000,000 MXN`.
- **When:** La transcripción de voz extrae un Precio de `$3,850,000 MXN`.
- **Then:** El sistema detecta el conflicto, presenta una alerta visual destacada y ofrece dos opciones:
  - *"Conservar manuales (Rellenar solo vacíos)"*: Mantiene los `$4,000,000 MXN` y solo llena los campos que estaban en blanco.
  - *"Sobrescribir con datos de IA"*: Aplica los `$3,850,000 MXN` extraídos por el LLM.

### Escenario 3: Carga y Optimización Síncrona de Fotos
- **Given:** El captador selecciona 1 o más imágenes de la propiedad (.jpg, .png, .webp).
- **When:** Las fotos se suben a S3 mediante `/api/upload`.
- **Then:** Next.js llama de forma síncrona a Flask `/api/v1/images/process` con `{ "s3_keys": string[] }`. Flask responde en menos de 5 segundos con metadatos y dimensiones (`width`, `height`, `format`), mostrándolos en la galería de miniaturas.

### Escenario 4: Persistencia Relacional y Auditoría en PostgreSQL 18
- **Given:** El usuario completa la revisión y hace clic en *"Guardar Propiedad"*.
- **When:** Se envía la petición a `POST /api/properties`.
- **Then:**
  1. Next.js valida el payload con el esquema Zod `propertyCreateSchema`.
  2. Inserta la propiedad en la tabla `properties` de PostgreSQL 18 vía Drizzle ORM.
  3. Registra una entrada append-only en la tabla `audit_logs` con trazabilidad del usuario y organización.
  4. Retorna status 201 y presenta la confirmación con ID de propiedad y opción de ver la cartera.

---

## 3. Contratos Afectados (`packages/contracts`)

- [x] Esquema `propertyTypeSchema`: `z.enum(["casa", "departamento", "terreno", "comercial"])`
- [x] Esquema `currencySchema`: `z.enum(["MXN", "USD"])`
- [x] Esquema `propertyCreateSchema`: Validación completa con tipos numéricos positivos y strings limpios.
- [x] Esquema `propertySchema`: Extensión con `id`, `organizationId`, `createdAt`, `updatedAt`.
- [x] Esquema `voiceExtractionOutputSchema`: Datos de salida estructurados devueltos por Whisper / LLM.
- [x] Esquema `imageProcessBatchRequestSchema` e `imageProcessBatchResponseSchema`: Procesamiento síncrono de fotos.
- [x] Función canónica `normalizeVoiceData(raw: unknown)`: Limpieza, coerción y tolerancia a errores de la IA.

---

## 4. Scorecard de Criterios de Aceptación (Verificación Automática)

| ID Criterio | Descripción Verificable | Tipo de Test | Archivo de Prueba | Estado |
| :--- | :--- | :--- | :--- | :--- |
| **AC-001** | Validación estricta de esquema Zod para creación de propiedades | Unit | `tests/unit/properties-schema.test.ts` | [x] **PASSED** |
| **AC-002** | Normalización y filtrado tolerante a fallos de IA con `normalizeVoiceData` | Unit | `tests/unit/properties-schema.test.ts` | [x] **PASSED** |
| **AC-003** | Comunicación BFF con microservicio satélite Flask enviando solo `s3_key` | Unit | `tests/unit/ai-satellite-client.test.ts` | [x] **PASSED** |
| **AC-004** | Consulta de tareas Celery con polling reactivo y estado de avance | Unit | `tests/unit/ai-satellite-client.test.ts` | [x] **PASSED** |
| **AC-005** | Renderizado del formulario interactivo, grabador de voz y galería | E2E | `tests/e2e/property-capture.spec.ts` | [x] **PASSED** |
| **AC-006** | Aislamiento de base de datos: Flask no conecta a PostgreSQL | Architecture | `ARCHITECTURE.md` | [x] **VERIFIED** |
| **AC-007** | Prohibición de modelos locales: Exclusivamente SDKs en la nube | Security | `backend-ai/tasks.py` | [x] **VERIFIED** |

---

## 5. Fuera de Alcance (Límites Estrictos para Evitar Drift)

- Modelos de IA locales autohospedados (ej. Ollama, Llama local).
- Modificación directa de esquemas de base de datos desde el servicio de Python/Flask.
- Envío de archivos binarios pesados multipart/form-data a Flask a través de HTTP interno (solo se transmiten S3 Keys).
