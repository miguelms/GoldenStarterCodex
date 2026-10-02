# FEAT-003 — separar gobernanza y stack técnico

Estado: `APPROVED_BY_USER` — implementación inicial en revisión de publicación

## Objetivo

Separar GoldenStarterCodex como fuente de gobernanza y GoldenStarterWebIA como fuente del stack técnico web con IA. Una aplicación nueva debe poder fijar ambas fuentes por versión y actualizarlas independientemente.

## Alcance

GoldenStarterCodex conserva custom agents, subagents, skills, política MCP, SDD/TDD, templates, specs, planes, gates abstractos y evidencia. GoldenStarterWebIA conserva código, dependencias, UI, backend IA, contratos, infraestructura, pruebas técnicas, CI y release del stack.

## Criterios de aceptación

| ID     | Criterio                                                                                                                 | Evidencia                                                  |
| ------ | ------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------- |
| AC-001 | Codex no contiene `src/`, `apps/`, `backend-ai/`, `packages/`, `drizzle/`, `package.json` ni dependencias Node del stack | `scripts/validate-codex-governance.py`                     |
| AC-002 | Codex conserva perfiles TOML, Agent Skills, SDD/TDD, specs y evidencia                                                   | inventario del repo y validación de gobernanza             |
| AC-003 | WebIA contiene el stack, sus dependencias, pruebas, CI y release técnico                                                 | `README.md`, `docs/repository-contract.md`, `package.json` |
| AC-004 | Ningún workflow de Codex ejecuta comandos técnicos del stack                                                             | `.github/workflows/ci.yml`                                 |
| AC-005 | El runbook define composición, lockfile, ownership y actualizaciones independientes                                      | `docs/guides/composing-with-goldenstarterwebia.md`         |
| AC-006 | La separación no modifica CCentral ni mezcla Antigravity con Codex                                                       | verificación de repositorios                               |

## Fuera de alcance

No se crea todavía el compositor CLI. No se incorporan aún GoldenStarterWebCore, GoldenStarterMobileCore ni GoldenStarterMobileIA; se dejan como variantes futuras del contrato.
