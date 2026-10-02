# Sesión de descubrimiento — base UI Shadcn

- Session ID: `2026-10-01-ui-foundation`
- Fecha/hora/zona: 2026-10-01, hora local no registrada (America/Tijuana)
- Repo y base SHA: GoldenStarterCodex / `ae67fc729d871ac4a771bfb93880f81931c67d67`
- Rama: `codex/feat-001-data-grid-sorting`
- Participantes: usuario, Codex, product_manager
- Fuentes consultadas: `AGENTS.md`, `docs/live-sessions/README.md`, `specs/templates/feature-spec.template.md`, `specs/FEAT-001-data-grid-sorting.md`, `docs/QUALITY.md`, `components.json`, `src/app/globals.css`, `src/components/ui/{button,input,textarea,label,card,badge,skeleton}.tsx`, `package.json`, `STACK.md`
- Estado: FUNCTIONAL_SPEC_APPROVED; visual design remains NEEDS_USER_REVIEW.

## Decisiones confirmadas

| ID    | Pregunta                                     | Decisión                                                                                                                                                              | Responsable                      | Evidencia                                                                |
| ----- | -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- | ------------------------------------------------------------------------ |
| Q-001 | ¿Qué temas debe cubrir la base?              | Tema claro y oscuro.                                                                                                                                                  | Usuario                          | Conversación principal, 2026-10-01: «baseline claro y oscuro»            |
| Q-002 | ¿Cuál es el propósito del conjunto?          | Selección común, acotada y probada; no copiar todo el catálogo oficial.                                                                                               | Usuario                          | Conversación principal, 2026-10-01                                       |
| Q-003 | ¿Qué familias deben especificarse?           | Tokens de color/superficie, tipografía, radios, foco, movimiento, variantes y estados para botones, inputs, etiquetas, tarjetas, badges, skeletons, menús y diálogos. | Usuario                          | Conversación principal, 2026-10-01                                       |
| Q-004 | ¿Dónde se probará antes de ampliar adopción? | Validar contrato y componente en GoldenStarterCodex antes de decidir adopción en CCentral.                                                                            | Contexto aceptado por el usuario | Contexto de la conversación anterior sobre GoldenStarterCodex y CCentral |

## Paquete confirmado por el usuario

| ID    | Decisión confirmada                                                                                    | Evidencia                                                      |
| ----- | ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------- |
| Q-005 | Dirección Base UI3 premium cálida: carbón/grafito y oliva; serif editorial para títulos y sans para UI | Confirmación del paquete en conversación principal, 2026-10-01 |
| Q-006 | Tema inicial del sistema y recordar override manual                                                    | Misma confirmación                                             |
| Q-007 | Primitivas Base UI debajo de wrappers estilo Shadcn                                                    | Misma confirmación                                             |
| Q-008 | Dialog cierra con Escape y clic fuera                                                                  | Misma confirmación                                             |
| Q-009 | AlertDialog no cierra por clic fuera; exige Cancelar o acción explícita                                | Misma confirmación                                             |
| Q-010 | Badge: default, secondary, outline, destructive, success, warning, info                                | Misma confirmación                                             |
| Q-011 | Escape en AlertDialog equivale a Cancelar: cierra sin ejecutar la acción                               | Conversación principal, 2026-10-02                             |

## Candidatos y validación pendiente

La paleta candidata para contrastar queda registrada en la spec: claro background `#EEEAE1`, surface `#F9F7F1`, foreground `#252720`, muted foreground `#686960`, primary `#52684E`, primary foreground `#FFFDF7`, border/input `#858176`; oscuro background `#171916`, surface `#20221E`, foreground `#F0ECDF`, muted foreground `#AAA99D`, primary `#C1CA8C`, primary foreground `#20221B`, border/input `#73746A`. La dirección está confirmada; cada valor exacto sigue siendo candidato y no tiene contraste medido ni PASS.

- Ya resueltas: dirección visual, Base UI frente a Radix, tema y persistencia, política de cierre declarada, siete badges. Se eliminan las preguntas abiertas anteriores sobre esos puntos.
- Restan contraste completo y tokens de estados, familias exactas serif/sans y fallbacks, compatibilidad/API de Base UI, validación de teclado/foco/AT y evidencia visual en ambos temas/viewports. Base UI3 identifica la referencia visual; no prescribe una versión de la librería.
- No se confirma una política de cambios sin guardar ni se inventan nuevas reglas de pending o Escape para AlertDialog. Esos detalles deben revisarse contra el contrato de primitives y consumidores antes de implementar.
- Esta actualización modifica solo la spec funcional y este registro. No implementa código ni altera cambios ajenos del checkout.
- Suite de pruebas, contraste medido, prueba con VoiceOver y validación de implementación: `NOT_RUN`.

## Cierre

- Spec relacionada: [`specs/FEAT-002-shadcn-ui-foundation.md`](../../specs/FEAT-002-shadcn-ui-foundation.md).
- Estado de spec funcional: `APPROVED_BY_USER` el 2026-10-01 (conversación principal: «spec aprobada»).
- Veredicto funcional: `APPROVED_BY_USER`; la aprobación no certifica contraste ni pruebas, que siguen `NOT_RUN`.
- Próximo paso registrado en esta sesión inicial: aprobar el artefacto visual y el plan; ambos fueron aprobados después, según el seguimiento siguiente.

## Seguimiento de implementación — 2026-10-02

- El usuario aprobó el plan técnico y la propuesta visual exacta Base UI3 v1 para web desktop y móvil responsive el 2026-10-01. La aprobación está registrada en los artefactos respectivos.
- Se instaló `@base-ui/react@1.8.0` exacto. La primera implementación y las pruebas están en curso. El cálculo automatizado de 70 pares de tokens CSS pasó, pero no sustituye pruebas del render.
- Sobre Escape en AlertDialog se envió una pregunta específica al usuario, sin respuesta directa hasta este seguimiento. La continuación solicitada el 2026-10-02 se implementó con la interpretación conservadora de «requiere Cancelar o acción explícita»: Escape tampoco cierra. Este detalle es una **inferencia de implementación**, no una decisión explícita nueva atribuida al usuario; puede ajustarse si aclara otra preferencia.
- TDD de esa regla: Playwright falló con el comportamiento Base UI por defecto (Escape cerraba) y pasó al cancelar `escape-key` en el wrapper. Falta la corrida integrada y QA final.
- Decisión posterior explícita del usuario, 2026-10-02: «Escape equivale a Cancelar». Se retiró el bloqueo de `escape-key`; se conserva el bloqueo de clic fuera. La prueba exige cierre, callback destructivo en cero y retorno de foco al disparador.
