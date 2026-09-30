# Sesión live Q&A con el agente PM

## Objetivo

Cerrar decisiones de producto con una conversación interactiva antes de que backend, mobile o infraestructura conviertan supuestos en código. El usuario puede hacer preguntas, corregir el contexto y rechazar una recomendación.

## Cuándo activarla

- PRD nuevo o cambio con decisiones clínicas, legales, de privacidad, permisos o costos.
- Respuestas escritas que necesitan repreguntas o contienen contradicciones.
- Antes de marcar `product-manager` como DONE y antes de pasar a `change-planner`.

## Preparación

1. Crear un archivo `docs/live-sessions/YYYY-MM-DD-<tema>.md` desde esta plantilla.
2. Registrar repo, base SHA, versión del kit, participantes y fuentes autorizadas.
3. Cargar solamente PRD, preguntas, stack y decisiones relevantes; no cargar secretos ni historias completas sin necesidad.
4. El agente PM enumera preguntas bloqueantes, decisiones ya respondidas y supuestos reversibles.

## Protocolo de conversación

1. El PM hace una sola pregunta bloqueante por turno y explica qué cambia si se elige cada opción.
2. El usuario puede responder, pedir ejemplos, cuestionar la recomendación o hacer una pregunta propia.
3. El PM clasifica cada intercambio como `DECISION`, `ASSUMPTION`, `RECOMMENDATION`, `BLOCKER` o `QUESTION`.
4. El PM no inventa rangos clínicos, obligaciones legales ni permisos; los deja pendientes y solicita al responsable adecuado.
5. Al detectar contradicción con una respuesta previa, pausa la decisión, muestra ambos textos y pide resolución explícita.
6. Cada decisión registra responsable, fecha, evidencia, impacto, archivos afectados y si requiere ADR.
7. Al final, el PM produce resumen, decisiones aceptadas, preguntas abiertas, cambios propuestos a PRD/AC/TASKS y un veredicto `READY`, `BLOCKED` o `NEEDS_REVIEW`.

## Mejoras incorporadas

- Conversación bidireccional en lugar de cuestionario de una sola respuesta.
- Preguntas priorizadas por impacto: bloqueante, importante u opcional.
- Revisión de contradicciones entre PRD, respuestas y stack.
- Distinción obligatoria entre decisión confirmada y supuesto reversible.
- Registro de transcript y decisiones trazado al SHA.
- Reanudación de una sesión sin perder contexto ni repetir decisiones cerradas.
- Confirmación final del usuario antes de cambiar requisitos sensibles.
- Enlaces directos entre respuesta, requisito, AC, tarea y ADR.
- Resumen de preguntas que deben pasar a clínica, legal, privacidad o seguridad.
- Prueba de calidad del propio agente: no marcar `READY` si quedan blockers.

## Salidas mínimas

- Transcript o resumen de la conversación sin secretos.
- `PRD.md` actualizado.
- `docs/questions-v0.1.md` actualizado.
- `TASKS.md` con el estado de T-002/T-010.
- ADRs para decisiones arquitectónicas.
- Resultado estructurado conforme a `docs/contrato-resultados.md`.

## Plantilla de sesión

Copiar lo siguiente a un archivo fechado:

```markdown
# Sesión live Q&A — <tema>

- Session ID: <id>
- Fecha/hora/zona: <timestamp>
- Repo y base SHA: <repo> / <sha>
- Participantes: usuario, product-manager, <clínica/legal/etc.>
- Fuentes cargadas: <archivos>
- Estado inicial: OPEN

## Decisiones ya respondidas

| ID    | Pregunta   | Respuesta   | Responsable | Evidencia | Estado    |
| ----- | ---------- | ----------- | ----------- | --------- | --------- |
| Q-001 | <pregunta> | <respuesta> | <persona>   | <fuente>  | CONFIRMED |

## Conversación

### Turno 1 — <actor>

- Tipo: QUESTION / DECISION / ASSUMPTION / BLOCKER / RECOMMENDATION
- Mensaje: <texto>
- Respuesta: <texto>
- Impacto: <archivos, AC, tareas>

## Contradicciones y bloqueos

<ninguno o lista>

## Cierre

- Decisiones confirmadas: <lista>
- Preguntas abiertas: <lista>
- Archivos a actualizar: <lista>
- Veredicto: READY / BLOCKED / NEEDS_REVIEW
- Próximo agente: <id>
```

## Regla de aprobación

La sesión no aprueba por sí sola el producto clínico. `READY` solo significa que el alcance está suficientemente definido para planificación; la aprobación clínica, legal, de privacidad y de seguridad sigue siendo independiente.
