# Stack Tecnológico — Golden Starter V2

> ID del starter: `golden-starter-v2`. Versión: `2.0.0`. Owner: `platform-release`.

## 1. Runtimes y Gestor de Paquetes

- **Node.js**: `>=24 <25` (Fijado en `.nvmrc` y `.node-version`).
- **npm**: `>=11 <12` con `package-lock.json` inmutable. Prohibido mezclar con yarn/pnpm.

## 2. Aplicación Web (Next.js)

- **Framework**: Next.js `16.3.5` (App Router).
- **Librería de UI**: React `19.2.0` / React DOM `19.2.0`.
- **Estilos**: Tailwind CSS `4.1.0` con `@tailwindcss/postcss`.
- **Estructura**:
  - `src/app`: Rutas públicas, páginas y Route Handlers (`src/app/api`).
  - `src/components`: Componentes reutilizables, UI primitives y DataGrid.
  - `src/lib`: Utilidades, clientes HTTP, storage y validación.
  - `src/server`: Lógica de autenticación, contexto de sesión y errores HTTP.

## 3. Aplicación Móvil (React Native / Expo)

- **Framework**: Expo SDK `57.0.24`.
- **Runtime**: React Native `0.86.3` sobre motor **Hermes**.
- **Navegación**: Expo Router `57.0.22` (basado en sistema de archivos).
- **Capacidades Offline**: Cola Outbox idempotente con UUIDv4 y almacenamiento local.

## 4. Microservicio Satélite de IA (Python / Flask)

- **Runtime**: Python `3.12-slim`.
- **Framework Web**: Flask `3.1.0` con Gunicorn `23.0.0` (red interna Docker, sin puertos expuestos).
- **Integraciones IA**: SDKs oficiales en la nube (`google-genai 1.0`, `openai 1.58`). Prohibido el uso de LLMs locales.
- **Acceso a Medios**: Boto3 `1.35` para leer objetos directamente desde AWS S3 con la clave enviada por Next.js.
- **Aislamiento de BD**: Estrictamente prohibido conectarse a PostgreSQL para operaciones CRUD.

## 5. Gestión Asíncrona (Redis / Celery)

- **Broker & Backend**: Redis `7-alpine` (`redis://redis:6379/0`).
- **Sistema de Colas**: Celery `5.4.0` (worker en contenedor dedicado `celery-worker`).
- **Objetivo**: Delegación de tareas pesadas (> 5s) como transcripción, visión y RAG.

## 6. Base de Datos y Persistencia

- **Motor**: PostgreSQL `18` (`postgres:18-alpine`).
- **Driver**: `postgres` (3.4.5).
- **ORM**: Drizzle ORM `0.45.2`.
- **Migraciones**: Drizzle Kit `0.31.10`.
- **Aislamiento**: Multi-tenant estricto mediante clave foránea obligatoria `organizationId`.

## 5. Autenticación y Autorización

- **Motor de Autenticación**: Better-Auth `1.7.5`.
- **Modelo de Permisos**: RBAC con resolución por contexto HTTP (`organizationId`, `userId`, `role`).
- **Gestión de Dispositivos**: Identificación por fingerprint y revocación administrativa en caliente.

## 6. Almacenamiento y Archivos

- **Abstracción**: `src/lib/storage.ts` con selector runtime `STORAGE_PROVIDER=local|s3`.
- **Local**: `storage/uploads/` para desarrollo y staging.
- **S3 / Compatible**: `@aws-sdk/client-s3` con control de traversal y sanitización de llaves.

## 7. Contratos y Validación

- **Librería**: Zod `4.6.5`.
- **Ubicación**: `packages/contracts/src/index.ts` exportado como `@starter/contracts`.
- **Regla**: Todo contrato compartido entre Web y Mobile se declara aquí como fuente única de verdad.

## 8. Calidad y Pruebas

- **Unitarias e Integración**: Vitest `2.1.9`.
- **E2E Web**: Playwright `1.63.0`.
- **Linter & Formatter**: ESLint `9.39.5` + Prettier `3.4.2`.
- **Monitoreo de Tipos**: TypeScript `5.7.2` estricto (`tsc --noEmit`).
