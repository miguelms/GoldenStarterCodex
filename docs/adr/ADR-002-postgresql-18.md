# ADR-002: PostgreSQL 18 como Motor Relacional Primario Estándar

- **Estado:** ACEPTADO
- **Fecha:** 2026-09-21
- **Decisores:** `orchestrator-agent`, `infra-data-agent`, `backend-agent`, `sre-agent`, `docs-agent`
- **Consultados:** `security-agent`, `platform-release-agent`
- **Referencias:** [`STACK.md`](../../STACK.md), [`docker-compose.yml`](../../docker-compose.yml), [`src/db/schema.ts`](../../src/db/schema.ts), [`docs/operations/enterprise-runbook.md`](../operations/enterprise-runbook.md)

---

## 1. Contexto y Planteamiento del Problema

El sistema **GS Vera Clinic / CareFlow HomeCare** procesa información crítica de salud, programación de turnos asistenciales, expedientes médicos regulados (NOM-004-SSA3-2012 / LFPDPPP) y pistas de auditoría inmutables. Los requerimientos no negociables para la capa de persistencia son:

1. **Garantías Transaccionales Estrictas (ACID):** Atomicidad y consistencia absoluta en el registro de check-ins de enfermería, signos vitales y asignación de órdenes de trabajo.
2. **Aislamiento Multi-Tenant Robusto:** Toda entidad de negocio debe estar particionada lógicamente por `organization_id`, soportando claves foráneas con integridad referencial restrictiva (`ON DELETE RESTRICT` o ausencia deliberada de borrado físico).
3. **Manejo Híbrido Relacional + JSONB:** Capacidad de almacenar estructuras semi-estructuradas (eventos de sincronización móvil offline en outbox, payloads de auditoría y addendas clínicas) con indexación eficiente y alto desempeño.
4. **Capacidades Enterprise y Extensiones Nativas:** Soporte nativo para generación de UUIDs, funciones criptográficas (`pgcrypto`), búsqueda de texto eficiente (`pg_trgm`) y telemetría de rendimiento de consultas (`pg_stat_statements`).
5. **Estabilidad a Largo Plazo (LTS):** Base de datos con amplio ciclo de vida de soporte, respaldada por la comunidad y con utilidades maduras de respaldo lógico y físico (`pg_dump`, `pg_restore`, replicación streaming).

---

## 2. Alternativas Consideradas

### 2.1 Opción A: MySQL / MariaDB

- **Descripción:** Motores relacionales estándar de amplia difusión comercial.
- **Razón de Descarte:**
  - El soporte para JSON semi-estructurado es inferior: almacena JSON como texto binario pero carece de índices especializados de inversión (GIN / GiST) comparables a los de PostgreSQL para consultar atributos internos con alto volumen de registros.
  - Mayor permisividad histórica en conversión de tipos de datos en modo permisivo, lo cual contraviene la rigurosidad requerida en expedientes médicos.
  - Menor integración y optimización en las herramientas modernas del ecosistema TypeScript/Drizzle (`postgres.js`).

### 2.2 Opción B: Bases de Datos de Documentos NoSQL (MongoDB, DynamoDB)

- **Descripción:** Almacenamiento basado en colecciones de documentos JSON sin esquema rígido.
- **Razón de Descarte:**
  - Carecen de integridad referencial declarativa en el motor. En un entorno médico multi-tenant, garantizar que un registro clínico no quede huérfano o sea asociado a un tenant erróneo recaería enteramente en la capa de aplicación, elevando el riesgo de corrupción de datos.
  - La auditoría estricta de pistas inmutables y la verificación formal de retención legal (5 años NOM-004) requieren consultas relacionales complejas y uniones transaccionales no nativas en NoSQL.

### 2.3 Opción C: SQLite Centralizado en Servidor

- **Descripción:** Base de datos relacional ligera integrada en un único archivo en disco.
- **Razón de Descarte:**
  - Aunque SQLite es la elección ideal para el outbox offline local en la aplicación móvil Expo (`apps/mobile`), es completamente inadecuada para el backend corporativo multi-usuario debido a los bloqueos de escritura a nivel de archivo (_database-level locks_) que provocan saturación y contención bajo concurrencia moderada.

### 2.4 Opción D: PostgreSQL 14/15/16 (Versiones Previas)

- **Descripción:** Versiones estables anteriores de PostgreSQL.
- **Evaluación:**
  - Aunque PostgreSQL 16 fue validado con éxito durante la etapa de contenedorización de staging (`postgres:16-alpine`), PostgreSQL 18 representa el estándar primario moderno del starter, incorporando mejoras críticas en el compilador JIT, reducción de I/O en operaciones de mantenimiento `VACUUM`, optimizaciones en escaneo de índices JSONB y una proyección LTS extendida para nuevos despliegues empresariales.

---

## 3. Decisión Adoptada

Se ratifica a **PostgreSQL 18** (imagen oficial `postgres:18-alpine`) como el **motor de base de datos relacional primario estándar** para el starter de GS Vera Clinic en desarrollo, staging y producción.

### Directrices de Implementación:

1. **Esquema Relacional Tipado mediante Drizzle ORM:**
   - Todo modelo de datos reside en `src/db/schema.ts` utilizando las primitivas tipadas de Drizzle (`pgTable`, `uuid`, `varchar`, `timestamp`, `jsonb`, `boolean`, `integer`).
   - Las migraciones incrementales se generan y ejecutan exclusivamente mediante Drizzle Kit (`npm run db:generate`, `npm run db:migrate`), generando archivos SQL puros en `drizzle/` sujetos a control de versiones.
2. **Campos JSONB Indexados:**
   - La tabla `sync_events` utiliza `payload: jsonb("payload").notNull()` para retener el contenido de eventos offline de enfermería antes de su conciliación final.
   - La tabla `audit_entries` utiliza `metadata: jsonb("metadata")` para registrar detalles contextuales de auditoría sin modificar el esquema relacional ante nuevos atributos de telemetría.
3. **Aislamiento Multi-Tenant Estricto:**
   - Todas las tablas de dominio contienen la columna `organization_id uuid NOT NULL REFERENCES organizations(id)`.
   - Índices compuestos en `(organization_id, id)` y `(organization_id, created_at)` aseguran que las consultas analíticas y de auditoría nunca ejecuten escaneos completos entre organizaciones distintas.
4. **Integridad Transaccional NOM-004-SSA3-2012:**
   - Prohibición deliberada de borrado físico (`DELETE CASCADE`). Los expedientes clínicos se archivan lógicamente mediante `status = 'archived'` y campos de auditoría inmutables (`archived_at`, `archived_by`, `archive_reason`).

---

## 4. Pros y Contras

### Pros

- **Garantía ACID Inquebrantable:** Cumplimiento de normativas médicas y de privacidad con durabilidad garantizada ante fallos del sistema operativo o contenedores.
- **Flexibilidad JSONB:** Combina la rigidez del modelo relacional con la versatilidad de documentos JSON indexables mediante índices GIN.
- **Ecosistema Amplio de Herramientas:** Compatibilidad total con herramientas SRE estándar (`pg_dump`, `pg_restore`, `pg_stat_activity`, PgBouncer, Prometheus Postgres Exporter).
- **Driver de Alto Rendimiento:** Uso de `postgres` (postgres.js) en Node.js, ofreciendo conexiones rápidas, soporte de pipelines y bajo uso de memoria sin el overhead de clientes C nativos.

### Contras y Mitigaciones

- **Consumo de Conexiones por Proceso:** PostgreSQL crea un proceso backend por cada conexión cliente, lo que puede saturar la memoria si la aplicación abre demasiadas conexiones concurrentes (_too many clients_).
  - _Mitigación:_ Se documenta en el Runbook SRE la configuración de pool de conexiones (`max: 10` en runtime web de producción) y la integración de PgBouncer ante escenarios de alta concurrencia.
- **Crecimiento de Volúmenes y Espacio en Disco:** Índices JSONB y tablas de auditoría crecen continuamente debido a la política append-only.
  - _Mitigación:_ Se establecen procedimientos SRE de monitoreo de disco, afinación de `autovacuum` y respaldos lógicos comprimidos diarios.

---

## 5. Validación y Conformidad

- **Verificación de Contenedor:** Verificado localmente en puerto `55432` y staging en puerto `5432` con comprobación de salud nativa `pg_isready`.
- **Migraciones Automáticas:** Ejecución exitosa de `npm run db:migrate` sobre la base de datos PostgreSQL.
- **Pruebas de Integración:** Suite `tests/integration/` valida transacciones, inserción de fixtures ficticios y consultas sobre columnas JSONB.
