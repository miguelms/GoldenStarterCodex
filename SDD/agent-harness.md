# Harness de agentes

El video distingue `AGENTS.md` para reglas del repositorio y skills para capturar flujos reutilizables. La conexión a cliente/protocolo (ACP en el ejemplo) no es necesaria para que Codex Desktop use sus perfiles y MCP conectados.

## Dónde vive hoy cada responsabilidad

| Responsabilidad | Fuente actual | Estado |
| --- | --- | --- |
| Reglas de repo: flujo, seguridad, TDD y cómo delegar | [`../AGENTS.md`](../AGENTS.md) | **Adoptado** |
| Flujos repetibles Q&A de producto/diseño | `../.agents/skills/live-product-qa/SKILL.md`, `../.agents/skills/live-design-review/SKILL.md` | **Adoptado** |
| Perfiles especialistas nativos Codex | `../.codex/agents/*.toml` | **Adoptado en configuración; revisión/aceptación del catálogo sigue su propio estado** |
| Ownership, cuándo delegar y handoffs | [`../docs/agent-registry.md`](../docs/agent-registry.md) | **Adoptado** |
| Contrato/evidencia de handoff | [`../docs/contrato-resultados.md`](../docs/contrato-resultados.md), schema y ejemplo `../docs/agent-result.*` | **Adoptado** |
| Perfiles especialistas Codex | `../.codex/agents/*.toml` | **Adoptado.** |

Las reglas del agente no deben duplicarse en cada spec. Una spec contiene el contexto y criterios de la feature; `AGENTS.md` y los perfiles definen cómo trabaja el harness.

## Stitch MCP y `ui_ux_designer`

GoldenStarterCodex es una plantilla y no necesita un proyecto visual de Stitch propio. El MCP de Stitch es una integración disponible al subagente para consultar el diseño de una app usuaria del starter, cuando la tarea incluye referencias externas. El contexto de la tarea debe identificar el proyecto y pantallas relevantes; el subagente no selecciona entre todos los proyectos del usuario por cuenta propia.

En la conexión disponible al redactar esta guía, las operaciones de lectura útiles incluyen `list_projects`, `get_project`, `list_screens`, `get_screen` y `list_design_systems`. Limita el análisis a referencias pertinentes. No uses operaciones que creen, editen, apliquen, compartan o eliminen recursos Stitch. No registres credenciales ni URLs firmadas. El perfil e instrucciones prohíben esas mutaciones; el MCP ofrece más capacidades que las necesarias para este rol.

La sesión de diseño de la aplicación usuaria es la evidencia durable de qué proyecto y pantallas consultó el subagente y qué criterios visuales extrajo. El starter documenta el procedimiento; la app usuaria posee sus fuentes de diseño.
