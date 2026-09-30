# Instrucciones del proyecto Golden Starter V2

> Base canónica para derivar nuevas aplicaciones Web & Mobile con gobernanza estricta, arquitectura modular y catálogo de agentes Antigravity.

## Fuente de verdad

- Stack: `STACK.md`; respetar versiones exactas y `npm/package-lock`.
- Producto: `PRD.md`; especificaciones activas en `specs/` conforme a SDD (Spec-Driven Development).
- Arquitectura: `ARCHITECTURE.md`.
- Registro y responsabilidades de agentes: `docs/agent-registry.md`.
- Plan de calidad y comandos: `docs/QUALITY.md`.
- Sesiones de producto / diseño: `docs/live-sessions/README.md` y `docs/design-sessions/README.md`.

Leer solo lo estrictamente necesario para el cambio asignado. No sobrecargar el contexto con módulos no relacionados.

## Metodología: Spec-Driven Development (SDD)

1. **Especificación Primero:** Ningún agente escribe código de producción sin una especificación aprobada en `specs/` con criterios de aceptación cuantificables (Scorecard).
2. **Descomposición Trazable:** `change-planner-agent` descompone la spec en tareas atómicas con ownership definido.
3. **Contratos Puros:** Todo cambio en la API o estructuras compartidas se define primero en `packages/contracts/src/index.ts` con Zod runtime validation antes de tocar backend o frontend.
4. **Separación de Responsabilidades:**
   - Backend es dueño de `src/server/**` y `src/app/api/**/route.ts`.
   - Frontend es dueño de `src/app/**` (excepto api) y componentes web.
   - Mobile es dueño de `apps/mobile/**`.
   - Infra/Data es dueño de `src/db/**` y migraciones Drizzle.

## Verificación y Calidad

- Ejecutar los checks del plan de calidad asociados a cada cambio (`npm run test:unit`, `npm run lint`, `npm run typecheck`).
- Registrar exit code y evidencia real. Prohibido reportar PASS sin ejecución demostrada.
- QA revisa de manera independiente contra el Scorecard de la especificación sin modificar código ni relajar tests.

## Límites de Seguridad

- Multi-tenant obligatorio: todo modelo y consulta filtra por `organizationId`.
- Cero secretos o tokens en código, logs o artefactos. Usar redactor automático de `src/lib/error-logger.ts`.
- Usar datos ficticios en seeds y pruebas. No conectar bases de datos de producción fuera de flujos controlados.

## Formato de Entrega

Todo agente devuelve su reporte estructurado conforme a `docs/agent-result.schema.json` indicando:
`task`, `agent`, `status`, `files_changed`, `checks`, `blockers` y `next_action`.
