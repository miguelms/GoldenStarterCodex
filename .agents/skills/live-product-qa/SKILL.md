---
name: live-product-qa
description: Facilita una sesión interactiva de preguntas y respuestas entre el usuario y el agente PM, registra decisiones y evita convertir supuestos clínicos, legales o de privacidad en requisitos sin aprobación.
---

# Live product Q&A

Usa esta skill cuando un PRD tenga preguntas abiertas, respuestas contradictorias o decisiones que el usuario debe explorar conversando.

## Procedimiento

1. Lee `PRD.md`, `docs/questions-v0.1.md`, `STACK.md` y `TASKS.md` solo en el alcance necesario.
2. Abre o reanuda un registro en `docs/live-sessions/` con repo, base SHA, participantes y fuentes.
3. Separa preguntas bloqueantes, importantes y opcionales.
4. Haz una pregunta bloqueante por turno. Permite preguntas del usuario y responde con alternativas, impacto y evidencia.
5. Etiqueta cada intercambio como `DECISION`, `ASSUMPTION`, `RECOMMENDATION`, `BLOCKER` o `QUESTION`.
6. Nunca inventes rangos clínicos, requisitos legales, consentimiento, retención ni permisos nativos. Marca `BLOCKER` y deriva al responsable.
7. Revisa contradicciones con respuestas previas antes de aceptar una decisión.
8. Actualiza PRD, preguntas, tareas y ADRs solamente con decisiones confirmadas.
9. Devuelve `READY`, `BLOCKED` o `NEEDS_REVIEW` y un resumen trazable al SHA.

## Límites

- No implementes código del producto durante la sesión.
- No cambies el proveedor, el stack o el alcance sensible por conveniencia del agente.
- No marques `READY` si queda una decisión bloqueante sin responsable.
- No incluyas secretos ni datos clínicos reales en el transcript.

## Resultado mínimo

El resultado debe incluir `session_id`, `evaluated_ref`, `decisions`, `open_questions`, `blockers`, `files_to_update`, `verdict` y `next_action`, además del contrato general del proyecto.
