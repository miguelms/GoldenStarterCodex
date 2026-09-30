# Sesiones live de diseño

Estas sesiones permiten revisar referencias de Google Stitch con `ui-ux-designer-agent` antes de que frontend o mobile implementen una interfaz.

## Flujo

1. Crear `YYYY-MM-DD-<feature>.md` desde la plantilla inferior.
2. Registrar la feature, plataformas y referencias de Stitch, sin API keys.
3. Inventariar pantallas existentes y estados faltantes.
4. Resolver una decisión material por turno.
5. Preparar una spec versionada en `docs/design-specs/`.
6. Presentar el paquete como `NEEDS_USER_REVIEW`.
7. Registrar `APPROVED_BY_USER` únicamente después de que el usuario acepte explícitamente la versión y su alcance.

Frontend y mobile deben comprobar el estado y la referencia aprobada antes de implementar trabajo visual. Los cambios materiales posteriores crean una versión nueva.

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
