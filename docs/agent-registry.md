# Registro de agentes — CareFlow HomeCare

Instancia: Antigravity project scope, 2026-09-20. Manifiestos: `.agents/agents/<name>/agent.md`.

| ID                  | Activar cuando                     | Escritura prevista                 | Tools                               | Skill cargado      | Integración  |
| ------------------- | ---------------------------------- | ---------------------------------- | ----------------------------------- | ------------------ | ------------ |
| orchestrator        | toda integración                   | TASKS y artifacts globales         | archivos, shell sandbox, subagentes | —                  | orchestrator |
| product-manager     | requisitos ambiguos o sesión Q&A   | PRD, specs, sesiones               | archivos sin shell                  | live-product-qa    | product      |
| repo-explorer       | repo existente o flujo desconocido | ninguna                            | lectura                             | —                  | orchestrator |
| change-planner      | impacto entre módulos              | artifacts/change-plans             | archivos sin shell                  | —                  | orchestrator |
| ui-ux-designer      | UI o flujo relevante               | specs y sesiones de diseño         | archivos sin shell                  | live-design-review | design       |
| frontend            | interfaz Next.js                   | src/app, components y estilos      | archivos, shell sandbox             | —                  | frontend     |
| mobile              | Android/iOS                        | apps/mobile                        | archivos, shell sandbox             | —                  | mobile       |
| backend             | API y contratos                    | server, route handlers, contracts  | archivos, shell sandbox             | —                  | backend      |
| infra-data          | schema o migración                 | DB y Drizzle                       | archivos, shell sandbox             | —                  | data         |
| test-engineer       | faltan pruebas                     | tests, E2E y fixtures              | archivos, shell sandbox             | —                  | QA           |
| debugger-regression | bug concreto                       | debug artifacts y test autorizado  | archivos, shell sandbox             | —                  | QA           |
| qa                  | cambio integrado                   | ninguna                            | lectura                             | —                  | QA           |
| security            | auth, datos o release              | reportes de seguridad              | archivos, shell sandbox             | —                  | security     |
| docs                | cambió comportamiento u operación  | documentación                      | archivos, shell sandbox             | —                  | docs         |
| platform-release    | deps, CI o entrega                 | package, lock, CI y release config | archivos, shell sandbox             | —                  | release      |
| devops              | despliegues, Docker y servidores   | Docker, Compose, Caddy/Nginx, CI/CD| archivos, shell sandbox             | production-deployment| devops     |
| sre                 | confiabilidad, salud y resiliencia | monitoreo, incidentes, runbook     | archivos, shell sandbox             | —                  | sre          |

## Política efectiva

`orchestrator-agent`, `product-manager-agent` y `ui-ux-designer-agent` son seleccionables como agente principal; todos pueden ser invocados como subagentes. Solo el orquestador recibe `invoke_subagent`. `qa-agent` y `repo-explorer-agent` son lectores estrictos sin shell. Los perfiles escritores usan `commandExecutionPolicy: sandbox`; el sandbox real del runtime prevalece sobre el ownership descrito en Markdown.

Solo se referencian skills que existen dentro del proyecto: `.agents/skills/live-product-qa`, `.agents/skills/live-design-review` y `.agents/skills/production-deployment`. `business-analyst`, `voice-ai` y `legacy-migration` permanecen fuera de esta instancia hasta que el alcance los necesite.

## Concurrencia e integración

Durante el piloto se ejecuta un escritor por ruta compartida. Hay un único owner para `TASKS.md`, `package.json`, lockfile y resultados globales. Los escritores paralelos requieren branch/workspace aislado y handoff con base SHA. QA revisa el cambio integrado y no corrige implementación.

El manifiesto se valida con `npm run check:agents`; los contratos de resultado se validan por separado. La aparición real de los perfiles se comprueba en Antigravity IDE/Desktop con `/agents`.
