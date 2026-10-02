# Roadmap — GoldenStarterCodex

**Estado:** `DRAFT` — propuesta derivada de los objetivos acordados en esta conversación.
**Owner:** propietario del starter.
**Fechas:** no asignadas.
**Fuente:** conversación del proyecto; antecedentes en `../TASKS.md`, `../docs/golden-project-plan.md` y la lista de mejoras de `../README.md`.

## Propósito y éxito esperado

GoldenStarterCodex debe ofrecer una base reutilizable de gobernanza, agentes, skills y flujo SDD/TDD que Codex pueda seguir de forma consistente. El stack técnico se selecciona desde un repositorio versionado como GoldenStarterWebIA. Un proyecto creado desde la composición debe conservar sus decisiones de proyecto, y cada feature debe poder rastrearse desde intención y criterios de aceptación hasta plan, código, pruebas y revisión.

El roadmap se revisa después de pilotos y cambios de alcance. Las ideas de `README.md` (OAuth, streaming, rate limiting, exportación, notificaciones) siguen siendo **propuestas no priorizadas** hasta que el owner las incorpore aquí.

## Fases

### R0 — Completar y aceptar el baseline de Codex

**Estado:** `IN_PROGRESS`

**Alcance:**

- Revisar perfiles especialistas y skills de Codex.
- Mantener el harness de Codex nativo y separado de la edición Antigravity del starter.
- Consolidar el contrato operativo SDD/TDD, checks, resultados y revisión.
- Confirmar el repo GitHub canónico de este starter.

**Salida verificable:** el owner acepta el catálogo y el flujo; las instrucciones no contradicen los archivos físicos; el remote corresponde al repo que el owner declara; los checks definidos reportan evidencia reproducible.

### R1 — Formalizar y pilotear el ciclo SDD

**Estado:** `PLANNED` — inicia después de cerrar R0 y confirmar el repositorio GitHub canónico de GoldenStarterCodex.

**Alcance:**

- Revisar este mapa y confirmar `constitution.md` y `roadmap.md`.
- Completar una feature acotada de GoldenStarterCodex desde spec hasta revisión de diff.
- Probar que cada AC remite a prueba/evidencia y que el plan queda separado de la implementación.
- Registrar desviaciones como hueco de spec, defecto de implementación o trabajo nuevo.

**Salida verificable:** una feature con spec aprobada, plan revisado, implementación en rama, pruebas con evidencia, revisión humana, commits pequeños y decisión explícita de merge/replan.

### R2 — Instanciar el flujo en CCentral

**Estado:** `PLANNED`

**Alcance:**

- Confirmar el repo GitHub local/remoto de CCentral y la identidad de su entorno.
- Crear o validar su contexto de proyecto: misión, stack real, arquitectura, despliegue manual de producción y proyecto Stitch que el owner confirme.
- Adoptar de GoldenStarter los componentes elegidos (incluidos Shadcn y el grid común) y CI solo con checks que no desplieguen producción.
- Especificar e implementar las mejoras propias de CCentral por feature.

**Salida verificable:** el flujo trabaja sobre el checkout/repo de CCentral confirmado, pasa sus checks relevantes y mantiene el despliegue de producción bajo el proceso manual documentado por CCentral.

### R3 — Replanear GoldenStarter para la siguiente versión

**Estado:** `PLANNED`

**Alcance:**

- Revisar resultados de CCentral y otros pilotos.
- Separar mejoras generalizables del starter de requisitos exclusivos de CCentral.
- Priorizar cambios de stack, grid, Shadcn, CI, SDD/TDD y perfiles reutilizables para la futura versión del starter.

**Salida verificable:** backlog priorizado y decisión de versión/branch del starter aprobada por el owner; cada cambio aceptado tiene spec o ADR según su alcance.

## Revisión del roadmap

Revisar este documento al cerrar R0 y después de cada piloto mayor. No marques una fase completada solo porque exista su documentación: debe cumplir su salida verificable y tener evidencia/revisión correspondiente.
