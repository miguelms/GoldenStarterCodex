# Sesiones live de diseño

Estas sesiones registran el Q&A de diseño en la conversación principal de Codex y las referencias verificadas de Stitch/Figma antes de que frontend o mobile implementen una interfaz. El subagente `ui_ux_designer` redacta el registro y la spec; no conduce la conversación ni aprueba el diseño.

## Flujo

1. Invocar `$live-design-review` en la conversación principal para aclarar alcance y decisiones materiales, una por turno.
2. La conversación principal busca referencias confirmadas en las sesiones de diseño previas del mismo producto o área. Si no encuentra una, descubre candidatos en Stitch/Figma con los MCP disponibles y confirma la fuente inicial con el usuario; no le pide buscar IDs ni muestra el inventario completo.
3. Identificar las pantallas/frames relevantes para esta feature y confirmar con el usuario el resumen de decisiones, plataformas y referencias antes de delegar. Registrar proyecto/archivo y sus IDs en la sesión que se redacte para que las tareas posteriores puedan reutilizarlos.
4. Pasar al subagente `ui_ux_designer` la feature, plataformas, base SHA, decisiones confirmadas y referencias seleccionadas. Usará MCP Stitch/Figma solo para lectura si están disponibles; si no hay MCP ni material verificable, devolverá `BLOCKED`.
5. El subagente crea el registro `YYYY-MM-DD-<feature>.md` y una spec versionada en `docs/design-specs/`, sin secretos ni URLs firmadas.
6. La conversación principal presenta el paquete como `NEEDS_USER_REVIEW`.
7. Registrar `APPROVED_BY_USER` únicamente después de que el usuario acepte explícitamente la versión y su alcance.

Frontend y mobile deben comprobar el estado y las referencias aprobadas antes de implementar trabajo visual. Los cambios materiales posteriores crean una versión nueva. La conexión MCP se configura en Codex fuera de estos documentos; no se guardan endpoints secretos ni credenciales en el repositorio.

## Plantilla

```markdown
# Sesión live de diseño — <feature>

- Session ID: <id>
- Fecha/hora/zona: <timestamp>
- Repo y base SHA: <repo> / <sha>
- Feature: <id/ruta>
- Plataformas: web / Android / iPhone / iPad
- Stitch project: <nombre/id>
- Stitch screens: <ids/nombres>
- Estado: DRAFT

## Inventario y cobertura

| Flujo/estado | Referencia Stitch | Plataforma   | Cobertura                | Acción   |
| ------------ | ----------------- | ------------ | ------------------------ | -------- |
| <flujo>      | <pantalla>        | <plataforma> | COMPLETE/PARTIAL/MISSING | <acción> |

## Conversación y decisiones

### Turno 1

- Tipo: QUESTION / DECISION / RECOMMENDATION / REVISION
- Mensaje: <texto>
- Respuesta: <texto>
- Impacto: <pantallas/plataformas/AC>

## Paquete de revisión

- Spec: docs/design-specs/<scope>-v<version>.md
- Diferencias conocidas: <lista>
- Decisiones abiertas: <lista>
- Estado: NEEDS_USER_REVIEW

## Aprobación

- Usuario aprobador: <nombre/rol>
- Fecha: <timestamp>
- Texto de aceptación: <cita o resumen inequívoco>
- Versión y alcance: <spec, pantallas, plataformas>
- Estado: APPROVED_BY_USER / pendiente
```
