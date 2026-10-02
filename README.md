# GoldenStarterCodex

GoldenStarterCodex es el repositorio de gobernanza para aplicaciones compuestas. Mantiene agentes Codex, skills, política MCP, SDD/TDD, plantillas, criterios de revisión y evidencia del proceso.

El stack técnico vive en repositorios independientes, actualmente [GoldenStarterWebIA](https://github.com/miguelms/GoldenStarterWebIA). GoldenStarterCodex no es la fuente de verdad de Next.js, React, Expo, PostgreSQL, UI ni dependencias de IA.

## Composición

Una nueva aplicación fija una versión de GoldenStarterCodex y una versión del stack técnico en `.golden/composition.yaml` y `.golden/lock.yaml`. El compositor instala la gobernanza y el stack como fuentes independientes, con ownership explícito y un diff revisable.

Consulta [docs/guides/composing-with-goldenstarterwebia.md](docs/guides/composing-with-goldenstarterwebia.md) para el runbook vigente.

## Alcance

- `.codex/agents/`: perfiles de roles y handoffs.
- `.agents/skills/`: flujos reutilizables de gobernanza, SDD, TDD, revisión y release.
- `SDD/`: ciclo de trabajo y mapa de artefactos.
- `specs/`, `artifacts/change-plans/` y `artifacts/results/`: especificaciones, planes y evidencia.
- `docs/`: catálogo, contratos de resultados, decisiones de gobernanza y sesiones.
