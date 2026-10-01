---
name: live-product-qa
description: Aclara requisitos con una sesión interactiva antes de redactar o cambiar el PRD o una spec; úsala cuando haya decisiones pendientes sobre alcance, reglas de negocio, privacidad, permisos o costos.
---

# Q&A de producto

Usa este flujo en la conversación principal de Codex. El diálogo con el usuario ocurre aquí; el subagente `product_manager` consolida las decisiones confirmadas en documentos del proyecto.

## Procedimiento

1. Lee solo las partes relevantes de `PRD.md`, `STACK.md`, `TASKS.md`, `docs/questions-v0.1.md`, las specs activas y los registros de decisiones relacionados. No cargues historial ajeno a la tarea ni secretos.
2. Identifica las decisiones que bloquean una spec útil. Haz una pregunta bloqueante por turno. Explica el efecto práctico de cada opción y da un ejemplo cuando ayude.
3. Clasifica cada respuesta o punto pendiente como `DECISION`, `ASSUMPTION`, `RECOMMENDATION`, `BLOCKER` o `QUESTION`. Separa las decisiones confirmadas por el usuario de tu análisis.
4. Busca contradicciones con requisitos existentes y respuestas previas. Si hay conflicto, muestra ambos puntos y pide al usuario que lo resuelva.
5. No inventes reglas de negocio, obligaciones legales, decisiones de privacidad, consentimiento, retención ni permisos. Registra como bloqueos las decisiones críticas que sigan abiertas.
6. No modifiques archivos mientras exploras los requisitos. Al terminar las preguntas, presenta al usuario un resumen conciso de las decisiones y pide que lo confirme.
7. Después de la confirmación, delega una tarea documental acotada a `product_manager` y pásale las decisiones confirmadas, las fuentes relevantes, el ID de la funcionalidad y el SHA base. No le pidas que converse con el usuario ni que tome decisiones.
8. El subagente redacta el registro en `docs/live-sessions/YYYY-MM-DD-<tema>.md` y la spec en `specs/FEAT-###-<slug>.md`. Debe dejar la spec en `DRAFT` y señalar bloqueos en vez de suponer.
9. Presenta las rutas creadas, un resumen y las preguntas pendientes. Cambia el estado de la spec a `APPROVED_BY_USER` solo después de que el usuario la apruebe. Actualiza `PRD.md` solo si una decisión confirmada cambia un requisito general del producto.

## Respuesta de cierre

Resume las decisiones confirmadas, los supuestos, las preguntas o bloqueos pendientes, los archivos creados o actualizados, el estado de la spec y el siguiente paso. El usuario no debe reconstruir el resultado leyendo toda la conversación.
