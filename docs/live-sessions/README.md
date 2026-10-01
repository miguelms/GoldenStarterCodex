# Sesiones de descubrimiento de producto

## Propósito

Registrar las decisiones de producto que se aclaran en la conversación principal de Codex antes de planear o implementar una funcionalidad.

## Flujo Codex

1. Invoca `$live-product-qa` cuando una funcionalidad nueva o un cambio de alcance requiera decisiones del usuario.
2. La conversación principal conduce el Q&A, una pregunta bloqueante por turno. Distingue decisiones confirmadas, supuestos, recomendaciones, preguntas y bloqueos.
3. Antes de delegar, presenta un resumen conciso de las decisiones al usuario y espera su confirmación.
4. Después de la confirmación, delega al perfil de proyecto `.codex/agents/product-manager.toml` la redacción del registro y la spec en borrador.
5. Presenta al usuario el resumen y las rutas de los archivos. La spec comienza en `DRAFT`; solo el usuario puede aprobarla como `APPROVED_BY_USER`.

El subagente no conduce el Q&A ni decide requisitos. Su sandbox permite escribir en el checkout, así que su instrucción limita las modificaciones a la documentación indicada; Codex no ofrece un allowlist de rutas por agente.

## Rutas de salida

- Registro de sesión: `docs/live-sessions/YYYY-MM-DD-<tema>.md`.
- Requisitos de la funcionalidad: `specs/FEAT-###-<slug>.md`, creado desde `specs/templates/feature-spec.template.md`.
- Actualiza `PRD.md` únicamente si una decisión confirmada cambia un requisito del producto general.

## Plantilla del registro

```markdown
# Sesión de descubrimiento — <tema>

- Session ID: <id>
- Fecha/hora/zona: <timestamp>
- Repo y base SHA: <repo> / <sha>
- Participantes: usuario, Codex, product_manager
- Fuentes consultadas: <rutas>
- Estado: DRAFT

## Decisiones confirmadas

| ID | Pregunta | Decisión | Responsable | Evidencia |
| --- | --- | --- | --- | --- |
| Q-001 | <pregunta> | <respuesta confirmada> | <persona> | <fuente/turno> |

## Supuestos, preguntas y bloqueos

<lista o ninguno>

## Cierre

- Spec relacionada: <ruta>
- Veredicto: READY / BLOCKED / NEEDS_REVIEW
- Próximo paso: <acción>
```

`READY` significa que el alcance está suficientemente claro para revisar una spec; no significa que la spec esté aprobada para implementación.
