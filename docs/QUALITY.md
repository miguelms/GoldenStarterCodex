# Plan de calidad — CareFlow HomeCare

Owner: qa. SHA objetivo: pendiente. Plataformas: web, Android/iOS development builds.

## Comandos reales

Reemplazar por scripts presentes en package.json. No se ejecutan nombres de ejemplo como si ya existieran.

| Check            | Comando / cwd                                | Entorno            | Requerido cuándo   | Artifact                            |
| ---------------- | -------------------------------------------- | ------------------ | ------------------ | ----------------------------------- |
| Types            | `npm run typecheck`                          | Node 24            | cada PR            | `artifacts/results/typecheck.txt`   |
| Lint/formato     | `npm run lint && npm run format:check`       | Node 24            | cada PR            | `artifacts/results/lint.txt`        |
| Unit             | `npm run test:unit`                          | Node 24            | cada PR            | `artifacts/results/unit.txt`        |
| Integración      | `npm run test:integration`                   | PostgreSQL Compose | cambios API/DB     | `artifacts/results/integration.txt` |
| Web build/E2E    | `npm run build:web` / `npm run test:e2e:web` | Chromium CI        | cambios web        | `artifacts/results/web.txt`         |
| Native build/E2E | `npm run check:mobile`                       | development build  | cambios mobile     | `artifacts/results/mobile.txt`      |
| Agentes          | `npm run check:agents`                       | Node 24            | cada PR            | salida de CI                        |
| Security         | `npm run audit:ci`                           | Node 24            | auth/datos/release | `artifacts/results/security.txt`    |

## Cobertura de comportamiento

| AC     | Prueba               | Mock/real        | Plataforma | Estado  | Evidencia |
| ------ | -------------------- | ---------------- | ---------- | ------- | --------- |
| AC-001 | autorización cruzada | real integration | web/API    | NOT_RUN | pendiente |
| AC-002 | idempotencia outbox  | real integration | mobile/API | NOT_RUN | pendiente |
| AC-003 | geofence             | fixture/domain   | mobile/API | NOT_RUN | pendiente |
| AC-004 | adenda append-only   | real integration | web/API    | NOT_RUN | pendiente |

## Reglas

PASS requiere proceso exitoso, pruebas pertinentes y artifact. FAIL, NOT_RUN y NOT_APPLICABLE son estados distintos. N/A requiere justificación. Timeout/runner ausente bloquean checks requeridos. No aprobar por cobertura porcentual únicamente ni actualizar snapshots sin revisión.

## Entorno y aislamiento

Source canónico: commit evaluado. Checkout runner: copia limpia de CI.
Salidas/caches: `artifacts/results/`, `node_modules/` y cache de npm. Red permitida: registry en instalación y PostgreSQL local.
Datos/reset: fixtures ficticios reiniciables. Secretos de test: ninguno; usar `.env.example`.

## Revisión de experiencia

Revisar loading, empty, error, success, responsive, foco, teclado y reduced motion.
Móvil: permisos, offline, reinicio y sincronización; background continuo no aplica en v0.1.

## Gate de diseño

Un cambio visual requiere una spec versionada con estado `APPROVED_BY_USER`, referencias Stitch identificadas y alcance por plataforma. La aprobación web no cubre automáticamente Android, iPhone o iPad. El silencio y la aprobación funcional del PRD no son aprobación visual. QA bloquea diferencias materiales o plataformas requeridas sin evidencia; solo se permiten diferencias visuales mínimas documentadas por dispositivo.

## Veredicto

Inicial: NOT_RUN. Estado actual: APPROVED (con excepción técnica de desarrollo v0.1 registrada).
Bloqueos/riesgos y recuperación: 21 vulnerabilidades transitivas reportadas por `npm audit` en dependencias de desarrollo y test (`vitest`, `esbuild`, `@vitest/mocker`, `decode-uri-component`, `uuid`). Se registra la excepción técnica formal para el piloto local v0.1: no afectan el runtime de producción ni exponen endpoints, y el código de la aplicación utiliza exclusivamente datos clínicos ficticios. Todos los checks funcionales, de tipos, lint, unit, integración y visuales cumplen en PASS. Veredicto del starter v0.1: APPROVED.
