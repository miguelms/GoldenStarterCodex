# SDD — Spec-Driven Development

Este directorio hace visible cómo GoldenStarterCodex aplica el método del video [Full Course: Spec-Driven Development with Coding Agents](https://www.youtube.com/watch?v=hy8UstR2NEg). Es un **mapa de cumplimiento y operación**, no una segunda copia de los documentos canónicos. Cuando un artefacto ya existe, aquí se indica dónde vive y qué falta; el contenido vigente se mantiene en su fuente actual.

El video enfatiza: una constitución con intención duradera, stack y roadmap; specs y planes por feature; implementación en rama; pruebas/evidencia y revisión humana; commits pequeños; y replanteamiento para mantener alineados roadmap, specs y código. Sus marcas de tiempo útiles son 1:34, 33:16, 47:00 y 57:19. Los nombres de archivo de este directorio son una organización local; el video describe el método, no impone estos nombres.

## Mapa de artefactos SDD

| Artefacto | Documento de este directorio | Fuente o estado actual |
| --- | --- | --- |
| Constitución del proyecto | [`constitution.md`](constitution.md) | Misión en `PRD.md`; stack en `STACK.md`; arquitectura en `ARCHITECTURE.md` y `docs/adr/`; reglas Codex en `AGENTS.md`. El remoto de GoldenStarterCodex está configurado y aún no tiene ramas. Stitch es una capacidad del subagente, no una fuente de diseño de este starter. |
| Roadmap vivo | [`roadmap.md`](roadmap.md) | Hay ideas en `README.md` y fases históricas en `docs/golden-project-plan.md`/`TASKS.md`; no están consolidadas como roadmap vigente. Este archivo crea una propuesta de roadmap basada en los objetivos acordados. |
| Spec por feature | [`feature-specs.md`](feature-specs.md) | Plantilla canónica en `specs/templates/feature-spec.template.md`; specs activas vivirían en `specs/`. Aún no hay una spec de feature activa. |
| Plan por feature | [`implementation-plans.md`](implementation-plans.md) | Perfil `change_planner`; destino previsto `artifacts/change-plans/`. Hoy solo hay `.gitkeep`, no un plan activo. |
| Pruebas y evidencia | [`verification.md`](verification.md) | Reglas en `docs/QUALITY.md` y `AGENTS.md`; casos AC en la plantilla; suites reales en `tests/`. |
| Ciclo de rama a merge y replanteamiento | [`feature-cycle.md`](feature-cycle.md) | El flujo parcial está en `README.md`, `AGENTS.md`, `TASKS.md` y skills. Este archivo explicita el ciclo completo del video. |
| Harness de agentes | [`agent-harness.md`](agent-harness.md) | Reglas en `AGENTS.md`; skills en `.agents/skills/`; perfiles Codex en `.codex/agents/`; catálogo en `docs/agent-registry.md`. |
| Change log | [`change-log.md`](change-log.md) | El video lo plantea como opción para visibilidad de stakeholders; no se mantiene uno en este repo. Git/PRs no se duplican aquí. |

## Mapa actual de GoldenStarterCodex

Este mapa describe las rutas presentes en el checkout inspeccionado. Para la evolución de SDD, este directorio y la tabla anterior documentan dónde se encuentra cada artefacto.

```text
GoldenStarterCodex/
├── .agents/
│   └── skills/                 Skills de producto, diseño y despliegue
├── .codex/agents/              16 perfiles TOML nativos de subagentes Codex
├── apps/mobile/                Cliente Expo / React Native
├── artifacts/
│   ├── change-plans/           Planes (actualmente solo .gitkeep)
│   ├── debug/ reports/ results/ Evidencia, diagnósticos e informes
├── backend-ai/                 Flask, Celery, Redis e integraciones de IA
├── docs/
│   ├── adr/                     Decisiones de arquitectura
│   ├── architecture/           Guías de arquitectura
│   ├── design-sessions/         Registro y plantilla de sesiones visuales
│   ├── live-sessions/           Q&A y decisiones de producto
│   ├── operations/ security/    Runbooks y revisión de seguridad
│   ├── QUALITY.md               Checks, evidencia y gates
│   ├── agent-registry.md        Catálogo Codex de perfiles y skills
├── drizzle/                     Migraciones y snapshots de PostgreSQL
├── packages/contracts/          Contratos compartidos con Zod
├── specs/
│   └── templates/               Plantilla de especificación por feature
├── src/
│   ├── app/                      Next.js: páginas, rutas y API
│   ├── components/               Componentes reutilizables
│   ├── db/ domain/               Persistencia y lógica de dominio
│   ├── hooks/ lib/ server/       Hooks, utilidades y lógica de servidor
├── tests/
│   ├── unit/ integration/ e2e/   Vitest, integración y Playwright
├── SDD/                          Mapa y artefactos del método SDD
├── AGENTS.md                     Instrucciones permanentes para Codex
├── PRD.md STACK.md               Requisitos/propósito y tecnologías
├── ARCHITECTURE.md               Arquitectura del sistema
├── TASKS.md                      Bitácora de tareas, no roadmap de producto
└── package.json / docker-compose* / configuración de toolchain
```

**Repositorios:** la edición original está en [GoldenStarterAntigravity](https://github.com/miguelms/GoldenStarterAntigravity); la edición Codex está en [GoldenStarterCodex](https://github.com/miguelms/GoldenStarterCodex). La rama [codex/agent-separation](https://github.com/miguelms/GoldenStarterCodex/tree/codex/agent-separation) contiene el baseline Codex y está configurada para seguirse localmente desde `origin`.

GoldenStarterCodex es un starter sin interfaz propia, así que no le corresponde asociar un proyecto visual de Stitch. Stitch está conectado como herramienta MCP para que `ui_ux_designer` consulte diseños de la aplicación que se esté diseñando; el subagente recibe el proyecto/pantallas pertinentes desde esa tarea. Su uso y límites están descritos en [`agent-harness.md`](agent-harness.md) y en `.codex/agents/ui-ux-designer.toml`.

## Estados

- **Adoptado:** hay una fuente canónica suficiente y el mapa apunta a ella.
- **Parcial:** existe una base, pero falta completar, usar o cerrar el ciclo.
- **Pendiente:** no existe una definición confirmada; no se inventa una decisión de producto.
- **Opcional:** el video lo sugiere para una necesidad concreta, no como requisito universal.

Las fichas de este directorio conservan el contenido específico en sus fuentes canónicas. Si una fuente cambia, actualiza su ficha y la tabla, no copies todo el contenido al mapa.
