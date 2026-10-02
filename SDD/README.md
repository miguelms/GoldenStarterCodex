# SDD en GoldenStarterCodex

GoldenStarterCodex conserva el método Spec-Driven Development y su ciclo TDD para aplicaciones compuestas. El repositorio no contiene el stack técnico; cada aplicación debe declarar su perfil técnico y sus versiones en `.golden/`.

## Mapa de artefactos

| Artefacto | Ubicación | Propietario |
| --- | --- | --- |
| Constitución y límites | `constitution.md`, `PRD.md`, `AGENTS.md` | GoldenStarterCodex |
| Roadmap de gobernanza | `roadmap.md`, `docs/golden-project-plan.md` | GoldenStarterCodex |
| Specs | `specs/` | Aplicación, usando templates Codex |
| Planes | `artifacts/change-plans/` | Aplicación/Codex |
| Evidencia | `artifacts/results/` | Aplicación/Codex |
| Handoffs y resultados | `agent-harness.md`, `docs/contrato-resultados.md` | GoldenStarterCodex |
| Stack y comandos | Repositorio técnico declarado por `.golden/composition.yaml` | Stack seleccionado |

## Composición

La fuente técnica actual es [GoldenStarterWebIA](https://github.com/miguelms/GoldenStarterWebIA). El runbook [composing-with-goldenstarterwebia.md](../docs/guides/composing-with-goldenstarterwebia.md) define creación, actualización, ownership y release.

GoldenStarterAntigravity puede usar la misma idea con sus propios agentes y configuración. Sus archivos no se importan automáticamente a Codex.
