# Sesión de descubrimiento — contrato de ordenación del data grid

- Session ID: `2026-10-01-data-grid-sorting`
- Fecha/zona: 2026-10-01, America/Tijuana; hora no registrada.
- Repo: [miguelms/GoldenStarterCodex](https://github.com/miguelms/GoldenStarterCodex)
- Rama/base: `codex/agent-separation` / `ae67fc729d871ac4a771bfb93880f81931c67d67`
- Participantes: usuario, conversación principal Codex, product_manager documental.
- Estado: `APPROVED_BY_USER` (spec funcional y diseño visual aprobados; ver actualización de verificación al final)

## Decisiones confirmadas

| ID    | Pregunta / alcance                              | Decisión                                                                                                                                                                      | Responsable | Evidencia                                               |
| ----- | ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- | ------------------------------------------------------- |
| Q-001 | ¿Ordenación desde encabezado?                   | Incluir ordenación por columna al pulsar encabezado                                                                                                                           | Usuario     | Contexto de continuación: objetivo previamente acordado |
| Q-002 | ¿Solo local o también servidor?                 | Incluir modo local Y modo servidor en FEAT-001                                                                                                                                | Usuario     | Turno: «confirmo modo local Y modo servidor incluido»   |
| Q-003 | ¿Qué contrato debe definirse antes de CCentral? | Comparación texto/números/fechas/vacíos, valores reales/accessor, búsqueda, filtros, selección, paginación, carga/error/vacío, móvil, teclado/tecnologías asistivas y pruebas | Usuario     | Contexto entregado en esta conversación                 |
| Q-004 | ¿Implementar ahora?                             | Preparar spec y sesión para revisión; todavía no implementar código                                                                                                           | Usuario     | Siguiente paso explícito del contexto                   |
| Q-005 | ¿Repos y trabajos posteriores?                  | GoldenStarterCodex separado de Antigravity y CCentral; Shadcn, CI/release, adopción y distribución posteriores                                                                | Usuario     | Contexto entregado en esta conversación                 |
| Q-006 | ¿Aprobar FEAT-001?                              | Spec funcional aprobada, incluidos ambos modos y reglas propuestas; revisión visual separada pendiente                                                                        | Usuario     | Turno del 2026-10-01: «spec aprobada»                   |

## Fuentes consultadas

- `AGENTS.md`, `.codex/agents/product-manager.toml`.
- `specs/templates/feature-spec.template.md`, `specs/README.md`, `SDD/feature-specs.md`, `docs/live-sessions/README.md`.
- `src/components/shared/data-grid/generic-crud-data-grid.tsx`.
- `tests/unit/generic-components.test.ts` (seis pruebas del grid).
- `vitest.config.ts`, `playwright.config.ts`.
- Búsqueda de usos en `src/`, `tests/`, `docs/` y `README.md`: ejemplo documental en `src/components/shared/README.md`; sin consumidor de producto ejecutable identificado.

## Hallazgos de la base

Ya existe ordenación local asc/desc/none y reset a página 1 al ordenar. Comparación usa row[key]; accessor renderiza JSX. Falta aria-sort, control móvil y contrato servidor. Pruebas existentes renderizan SSR; no prueban eventos. No se ejecutó la suite antes ni durante esta tarea: `NOT_RUN`.

## Supuestos, recomendaciones y preguntas abiertas

La petición del usuario autoriza un borrador revisable con recomendaciones explícitas; no convierte reglas sugeridas en decisiones confirmadas. La spec marca RECOMMENDATION el ciclo conservado, desempate estable, nulos al final, comparadores y sortValue, búsqueda/filtros, query servidor controlada, selección por IDs, exportación por página servidor, estados y móvil. Requieren aprobación los cinco puntos de revisión de la spec, con agrupación funcional y visual. No hay aprobación visual desktop/móvil ni referencia Stitch/Figma suministrada.

La revisión del modo servidor confirma alcance, no un backend particular. Se propone un consumidor fake para verificar callbacks, páginas y descarte de respuestas obsoletas; el futuro consumidor real conserva esas responsabilidades. No se decide distribución a CCentral.

## Cierre del descubrimiento y aprobaciones

- Spec relacionada: [FEAT-001-data-grid-sorting](../../specs/FEAT-001-data-grid-sorting.md).
- Resultado del descubrimiento: spec funcional aprobada; las recomendaciones y preguntas anteriores documentan el proceso previo a Q-006 y quedaron resueltas por esa aprobación. El estado final de implementación se registra abajo.

## Seguimiento de implementación y verificación — 2026-10-01

- Se completó FEAT-001 en `codex/feat-001-data-grid-sorting`; revisión visual desktop/móvil aprobada y evidencia registrada.
- Verificación: 65 pruebas unitarias, 19 browser tests, typechecks, lint, build web, E2E web, check móvil y Prettier en PASS.
- VoiceOver manual: el usuario confirmó PASS en la fixture local; el registro está en [manual-assistive](../../artifacts/results/FEAT-001/manual-assistive.md).
- El usuario aceptó temporalmente el riesgo de `GHSA-86w9-cpqp-85rv`. La excepción queda limitada a `node-forge@1.4.0` y su ruta en Expo, requiere revisión el 2026-10-31 y caduca el 2026-11-01. Auditorías de producción y árbol completo pasan con cero hallazgos altos/críticos sin aceptar.
- Estado de spec: `VERIFIED`; no hay release, PR, push o despliegue asociado a este cierre.
- Evidencia y límites: [verification.md](../../artifacts/results/FEAT-001/verification.md), [excepción de riesgo](../security/FEAT-001-node-forge-risk-acceptance.md).
