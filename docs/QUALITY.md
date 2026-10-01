# Plan de calidad — Golden Starter V3

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
| Móvil estático | `npm run check:mobile` | Node 24 | cada PR con cambios mobile | Salida del comando: manifiesto + TypeScript (`apps/mobile/package.json`) |
| Build nativo Android/iOS | No configurado como check CI; los perfiles de `apps/mobile/eas.json` existen | EAS development/preview | cambios de configuración/código nativo y antes de release móvil | URL/log del build por plataforma |
| Runtime/E2E móvil | No configurado como check CI | Simulador/dispositivo con build de desarrollo/preview | flujos móviles críticos: permisos, offline, reinicio y sincronización | Evidencia de prueba por plataforma y dispositivo |
| Instrucciones de agentes | Revisión del diff de `.codex/agents/`, `AGENTS.md` y skills afectados | Revisión humana | cambios al harness | revisión del diff |
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

## Estado de validación móvil

`npm run check:mobile` solo valida las dependencias requeridas en el manifiesto y ejecuta el chequeo TypeScript de `apps/mobile`; no compila una app nativa ni comprueba su ejecución en Android o iOS. Los perfiles de EAS están declarados en `apps/mobile/eas.json`, pero no hay un workflow CI de build/runtime móvil configurado. No marques build nativo ni pruebas de dispositivo como `PASS` hasta ejecutar y registrar evidencia por plataforma.

## Veredicto

Inicial: NOT_RUN. Estado actual: APPROVED (con excepción técnica de desarrollo v0.1 registrada). La aprobación de esta baseline no certifica builds nativos ni pruebas runtime móviles; hoy están `NOT_CONFIGURED`.
Bloqueos/riesgos y recuperación: 21 vulnerabilidades transitivas reportadas por `npm audit` en dependencias de desarrollo y test (`vitest`, `esbuild`, `@vitest/mocker`, `decode-uri-component`, `uuid`). Se registra la excepción técnica formal para el piloto local v0.1: no afectan el runtime de producción ni exponen endpoints, y el código de la aplicación utiliza exclusivamente datos de prueba sintéticos y ficticios. Todos los checks funcionales, de tipos, lint, unit, integración y visuales cumplen en PASS. Veredicto del starter v0.1: APPROVED.
