# Constitución del proyecto — GoldenStarterCodex

## Propósito

Esta ficha reúne las decisiones duraderas que orientan el trabajo futuro. El video propone conservar misión, stack y roadmap como contexto persistente; no requiere que estén en un solo archivo. Para evitar duplicar fuentes, esta constitución apunta a los documentos canónicos del repo.

## Misión y éxito

- **Qué debe contener:** problema que resuelve el starter, usuarios/consumidores previstos, capacidades base y señales de que sirve como punto de partida fiable.
- **Fuente actual:** [`../PRD.md`](../PRD.md), secciones de visión, capacidades núcleo e instanciación.
- **Estado:** **Adoptado**, aunque el PRD describe capacidades y pasos, no métricas de éxito medibles.

## Stack y límites técnicos

- **Qué debe contener:** la constitución exige que cada aplicación declare una fuente técnica versionada, sus límites y sus gates.
- **Fuente actual:** [GoldenStarterWebIA](https://github.com/miguelms/GoldenStarterWebIA) y el `composition.yaml`/`lock.yaml` de la aplicación consumidora.
- **Estado:** **Separado**. GoldenStarterCodex no fija runtimes, frameworks, paquetes ni comandos del stack.

## Arquitectura y decisiones

- **Qué debe contener:** límites entre componentes, flujos de datos, seguridad, decisiones con tradeoffs y sus consecuencias.
- **Fuente técnica:** [`GoldenStarterWebIA/docs/repository-contract.md`](https://github.com/miguelms/GoldenStarterWebIA/blob/main/docs/repository-contract.md) y la documentación de arquitectura/ADR que mantenga el repositorio técnico seleccionado por la aplicación.
- **Estado:** **Adoptado**, con la arquitectura técnica fuera de este repositorio. Actualiza la fuente técnica y registra aquí cualquier decisión de gobernanza que cambie sus límites o tradeoffs.

## Roadmap

- **Qué debe contener:** fases futuras, prioridad, estado y condición verificable para considerar cada fase terminada.
- **Fuente actual:** [`roadmap.md`](roadmap.md), creado como roadmap de trabajo revisable. El listado de ideas de `../README.md` y las fases de `../docs/golden-project-plan.md` son antecedentes, no equivalen a este roadmap priorizado.
- **Estado:** **Parcial / en revisión**. Sin fechas ni prioridades inventadas; el dueño del proyecto debe confirmar el orden.

## Repositorio y diseño externo

- **Edición original:** [GoldenStarterAntigravity](https://github.com/miguelms/GoldenStarterAntigravity), renombrado desde GoldenStarterV3.
- **Repositorio de esta edición Codex:** [GoldenStarterCodex](https://github.com/miguelms/GoldenStarterCodex).
- **Rama de trabajo Codex:** `codex/agent-separation`, publicada en el repositorio Codex y seguida por `origin/codex/agent-separation`.
- **Interfaz de GoldenStarterCodex:** no es una aplicación con UI propia. No requiere asociar un proyecto visual Stitch.
- **Stitch MCP:** herramienta conectada para que el perfil `ui_ux_designer` consulte, en modo de solo lectura, diseños de las aplicaciones que utilicen el starter. La tarea de diseño debe indicar el proyecto/pantallas externos pertinentes; no son parte de la identidad visual de GoldenStarterCodex.
- **Referencias por feature de otra app:** registrar IDs de pantallas/frames y alcance en la sesión de diseño de esa aplicación bajo `docs/design-sessions/`.
- **Estado:** repositorios de ambas ediciones identificados y separados; Stitch es una capacidad del subagente, no una asociación de proyecto para este starter.

## Reglas y calidad

- **Qué debe contener:** instrucciones permanentes, boundaries operativos, SDD/TDD y checks reproducibles.
- **Fuentes actuales:** [`../AGENTS.md`](../AGENTS.md), [`../docs/QUALITY.md`](../docs/QUALITY.md) y [`../docs/contrato-resultados.md`](../docs/contrato-resultados.md).
- **Estado:** **Adoptado**, con gates en diferentes archivos para que cada documento tenga una responsabilidad concreta.

## Política de cambio

Una modificación a misión, contrato de composición, límites de seguridad o proceso de gobernanza requiere actualizar su fuente canónica y revisar las specs afectadas. Un cambio de stack se documenta y publica en su repositorio técnico, pero no modifica esta gobernanza por accidente.
