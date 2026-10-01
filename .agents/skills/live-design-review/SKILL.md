---
name: live-design-review
description: Facilita una sesión interactiva de diseño con referencias de Google Stitch y exige aprobación explícita antes de implementar web o React Native.
---

# Live design review

Usa esta skill para convertir referencias visuales en una especificación aprobable sin adelantar implementación.

## Fuentes y autoridad

1. `PRD.md` y las decisiones confirmadas gobiernan comportamiento, permisos y reglas de negocio.
2. El proyecto y las pantallas identificadas de Google Stitch gobiernan lenguaje visual, composición y tokens.
3. La spec versionada documenta la adaptación a web, Android, iPhone e iPad.
4. Una referencia faltante o inaccesible es una limitación explícita; nunca se sustituye con evidencia inventada.

## Procedimiento

1. Abre o reanuda una sesión en `docs/design-sessions/` y registra base SHA, feature, plataformas y referencias Stitch.
2. Verifica `StitchMCP` listando los proyectos disponibles. Pide al usuario elegir solo si el proyecto objetivo no se deduce con seguridad.
3. Inventaría pantallas, componentes, tokens y estados cubiertos. Mapea los faltantes contra los criterios de aceptación.
4. Separa decisiones materiales de detalles rutinarios. Pregunta una decisión material por turno y permite que el usuario pregunte, rechace o solicite variantes.
5. Cuando aporte valor, presenta dos o tres opciones comparables con recomendación, impacto y plataformas afectadas. No fabriques variantes por rutina.
6. Conserva el original de Stitch. Para cambios visuales, entrega instrucciones precisas para modificar o duplicar una pantalla; usa mutaciones MCP solo si el usuario las solicita y el tool las permite.
7. Actualiza `docs/design-specs/<scope>-v<version>.md` con tokens, componentes, navegación, estados, accesibilidad, responsive y diferencias nativas.
8. Presenta un paquete de revisión con versión, pantallas, decisiones abiertas y diferencias conocidas. Cambia a `APPROVED_BY_USER` solo tras aceptación explícita del usuario.

## Preguntas materiales

Pregunta por navegación principal, jerarquía de información, densidad operativa, ubicación de acciones o alertas del sistema, identidad visual, diferencias relevantes entre plataformas y cualquier alternativa que cambie el flujo. Resuelve espaciado, breakpoints, estados estándar y uso de componentes ya aprobados sin interrumpir al usuario.

## Estados

- `DRAFT`: trabajo incompleto o con decisiones materiales abiertas.
- `NEEDS_USER_REVIEW`: paquete completo listo para que el usuario lo evalúe.
- `APPROVED_BY_USER`: el usuario aprobó una versión, alcance y referencias concretas.
- `SUPERSEDED`: existe una versión aprobada posterior.

No interpretes silencio, ausencia de objeciones, una aprobación del PM ni un `COMPLETED` técnico como aprobación visual.

## Registro de aprobación

Incluye `design_session_id`, estado, fecha, usuario aprobador, texto de aceptación, feature, plataformas, proyecto/pantallas Stitch, versión de spec, base SHA, decisiones abiertas y siguiente acción. No almacenes API keys, tokens ni URLs firmadas.

## Límites

- No escribas frontend, React Native, dependencias o configuración de release.
- No presentes una pantalla web como validación de Android, iPhone o iPad.
- No declares accesibilidad o fidelidad visual sin método y evidencia.
- Un cambio material posterior invalida el gate de la versión afectada hasta una nueva revisión.
