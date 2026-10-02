# Quality gates de gobernanza

Este documento define gates abstractos para GoldenStarterCodex. Los comandos concretos pertenecen al perfil técnico de la aplicación y no se duplican aquí.

| Gate | Propósito | Evidencia |
| --- | --- | --- |
| Governance syntax | TOML válido, skills con frontmatter y catálogo consistente | `artifacts/results/governance-validation.txt` |
| Boundary check | Ninguna dependencia técnica dentro del repo de gobernanza | salida de `validate-codex-governance.py` |
| SDD completeness | Spec aprobada, criterios verificables y plan cuando aplique | `specs/`, `artifacts/change-plans/` |
| TDD evidence | Red, Green y Refactor documentados para cambios de comportamiento | `artifacts/results/` |
| Independent QA | Revisión separada contra criterios y evidencia | `artifacts/results/` |
| MCP policy | Capacidad, permiso, destino y fallback documentados | `SDD/agent-harness.md` |
| Release | Validación de gobernanza y archivo versionado | workflow de governance release |

El perfil técnico seleccionado por la aplicación debe mapear sus gates de typecheck, lint, unit, integración, E2E, auditoría y build a este contrato.
