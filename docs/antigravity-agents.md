# Agentes locales de Antigravity — Golden Starter V2

Este documento registra los agentes especializados configurados en el proyecto local bajo `.agents/agents/` y `.agents/skills/`.

## Catálogo de Agentes

| Agente | Tipo | Rol Principal |
| :--- | :--- | :--- |
| `orchestrator-agent` | Principal / Subagente | Coordina especialistas, actualiza `TASKS.md` y valida gates |
| `product-manager-agent` | Principal / Subagente | Conduce sesiones Q&A y formaliza requisitos en `specs/` |
| `change-planner-agent` | Subagente | Descompone especificaciones en planes atómicos |
| `backend-agent` | Subagente | Implementa Route Handlers y lógica de backend |
| `frontend-agent` | Subagente | Construye la interfaz web en Next.js 16 |
| `mobile-agent` | Subagente | Desarrolla la aplicación móvil Expo 57 / React Native |
| `infra-data-agent` | Subagente | Gestiona esquemas PostgreSQL 18 y migraciones Drizzle |
| `test-engineer-agent` | Subagente | Escribe suites de pruebas unitarias, integración y E2E |
| `qa-agent` | Subagente | Revisa evidencia y valida el Scorecard de la spec |
| `security-agent` | Subagente | Audita multi-tenant, sanitización y secretos |
| `devops-agent` | Subagente | Docker Compose, Caddy/Nginx y empaquetado |
| `sre-agent` | Subagente | Resiliencia, backups a S3 y runbooks operativos |
| `docs-agent` | Subagente | Mantiene documentación técnica alineada con el código |
| `debugger-regression-agent` | Subagente | Reproduce fallos y genera pruebas de regresión |
| `repo-explorer-agent` | Subagente | Inspecciona el repositorio sin modificar archivos |
| `platform-release-agent` | Subagente | Dependencias compartidas, scripts y lockfile |
| `ui-ux-designer-agent` | Subagente | Diseña flujos, estados de UI y tokens de diseño |

## Skills Locales

1. `live-product-qa`: Sesión interactiva de preguntas y respuestas para formalizar specs sin asumir requisitos.
2. `live-design-review`: Revisión iterativa de diseño e interfaz con Google Stitch.
3. `production-deployment`: Guía operativa para despliegues con Docker Compose, PostgreSQL 18 y Caddy SSL.
