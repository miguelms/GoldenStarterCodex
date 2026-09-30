# Product Requirements Document (PRD) — Golden Starter V3

> Documento canónico de requisitos del **Golden Starter V3 (GSv3)**.  
> Base arquitectónica universal, pura y 100% agnóstica a cualquier dominio de negocio.

---

## 1. Visión y Propósito

Proporcionar una plantilla de inicio corporativa, lista para producción inmediata, que elimine la fricción de configuración técnica en nuevas aplicaciones web, APIs y móviles, garantizando desde el primer commit:
- Arquitectura **Backend for Frontend (BFF)** con Next.js 16 y microservicio satélite de IA en Python/Flask + Celery + Redis.
- Aislamiento multi-tenant por organización sobre **PostgreSQL 18** y **Drizzle ORM**.
- Autenticación completa con **Better Auth** (sesiones, cuentas, tokens).
- Sistema de componentes canónico con **Shadcn UI** y **Generic DataGrid** con vista responsiva para móvil.
- Almacenamiento híbrido para archivos crudos con **AWS S3** y fallback local seguro.
- Soporte para clientes móviles en **Expo 57 / React Native** con sincronización offline tolerante a fallos.
- Gobernanza de **17 agentes de IA especializados** bajo la metodología **Spec-Driven Development (SDD)**.

---

## 2. Capacidades del Núcleo Agnóstico

1. **Gestión de Cuentas y Organizaciones:**
   - Multi-tenant estricto: `organizations` -> `users` -> `roles` (`admin_global`, `org_admin`, `manager`, `member`, `viewer`).
   - Autenticación nativa con Better Auth sobre PostgreSQL 18.
2. **Orquestación BFF y Microservicio Satélite:**
   - Next.js 16 gestiona la API pública, validaciones con Zod y persistencia transaccional.
   - Flask y Celery ejecutan tareas pesadas de IA y medios en red interna aislada (sin acceso directo a la BD).
3. **Registro y Seguridad de Dispositivos:**
   - Registro de huellas digitales de dispositivos (`devices`).
   - Revocación administrativa con puesta en cuarentena inmediata.
4. **Cola de Sincronización Offline (Outbox):**
   - Soporte de operación sin conexión en clientes móviles y web.
   - Deduplicación idempotente en servidor por UUIDv4 (`sync_events`).
5. **Almacenamiento de Medios (AWS S3):**
   - Subida y validación tipada vía Next.js. Traspaso de `s3Key` hacia Flask sin enviar binarios pesados por HTTP.
6. **Auditoría Append-Only & Error Tracking:**
   - Registro inmutable de eventos (`audit_logs`) y logs con redacción de secretos (`error_logs`).

---

## 3. Cómo Instanciar una Nueva Aplicación desde GSv3

Para crear cualquier aplicación sobre este starter:
1. **Especificación SDD (`specs/`):**
   - Copiar `specs/templates/feature-spec.template.md` a `specs/<mi-nueva-app>.md`.
   - Redactar casos de uso, escenarios Given/When/Then y scorecards de aceptación (`AC-001`).
2. **Contratos (`packages/contracts/src/index.ts`):**
   - Definir los esquemas Zod de las entidades del nuevo dominio.
3. **Base de Datos (`src/db/schema.ts`):**
   - Declarar las nuevas tablas con Drizzle ORM y ejecutar `npm run db:generate`.
4. **Pantallas y Componentes (`src/app/`):**
   - Crear las rutas de la app usando los componentes oficiales Shadcn UI y `GenericCrudDataGrid`.
5. **Tareas de IA (`backend-ai/tasks.py`):**
   - Definir los prompts y estructuras JSON que los workers de Celery procesarán con OpenAI / Gemini.
