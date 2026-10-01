---
name: live-design-review
description: Aclara decisiones visuales y convierte referencias verificables de Stitch o Figma en una spec de diseño revisable antes de implementar una interfaz.
---

# Revisión de diseño en vivo

Usa este flujo en la conversación principal para definir una interfaz con el usuario y producir una spec visual que frontend o mobile puedan implementar. La conversación principal mantiene el diálogo; el subagente `ui_ux_designer` investiga las referencias conectadas y redacta los artefactos después de que el usuario confirme el resumen de decisiones.

## Autoridad de las fuentes

1. `PRD.md`, la spec funcional y las decisiones confirmadas gobiernan comportamiento, reglas de negocio y permisos.
2. Las referencias seleccionadas de Stitch y Figma gobiernan el lenguaje visual, composición y tokens que muestran.
3. La spec de diseño documenta cómo se adaptan esos requisitos y referencias a cada plataforma.
4. No inventes pantallas, tokens, interacciones ni evidencia de herramientas externas.

## Flujo

1. Aclara la funcionalidad, las decisiones de producto ya confirmadas, las plataformas y el alcance de pantallas. Consulta solo las fuentes necesarias.
2. Busca en `docs/design-sessions/` sesiones previas del mismo producto o área. Reutiliza los proyectos/archivos de diseño allí identificados cuando sean accesibles y pertinentes; no vuelvas a pedir al usuario la asociación ya confirmada.
3. Si no existe una referencia previa pertinente, usa los MCP disponibles para descubrir candidatos a partir del nombre del producto/repositorio y el área funcional. Inspecciona solo candidatos plausibles; no hagas que el usuario busque IDs ni le presentes el inventario completo. Incluye un candidato claro en el resumen de diseño para que el usuario confirme la referencia inicial. Si hay varios candidatos plausibles o ninguno, haz una sola pregunta concreta para resolverlo. Registra el proyecto/archivo confirmado y sus IDs en la sesión de diseño que produce esta tarea, para que futuras tareas puedan encontrarlo allí.
4. Identifica las pantallas o frames relevantes dentro de la fuente asociada. Registra sus IDs y la cobertura de plataformas en la sesión de diseño. No supongas que la coincidencia del proyecto implica que todas sus pantallas son relevantes.
5. Si no hay MCP, acepta referencias verificables proporcionadas por el usuario que puedan consultarse en el entorno. Si no hay acceso a referencias utilizables, informa `BLOCKED` y pide la conexión o el material faltante. No describas contenido de una URL o archivo que no pudiste leer.
6. Separa comportamiento ya definido de decisiones visuales materiales. Haz una pregunta material por turno y presenta alternativas cuando ayuden a decidir. Resuelve detalles rutinarios solo cuando estén cubiertos por un patrón visual aprobado.
7. Al completar el Q&A, presenta un resumen de decisiones y referencias al usuario. Espera su confirmación antes de delegar la redacción.
8. Delega al subagente `ui_ux_designer` el análisis de las referencias seleccionadas y la redacción de los artefactos. Pásale alcance, decisiones confirmadas, plataformas, feature ID, base SHA, referencias y cualquier spec funcional relacionada.
9. El subagente usa Stitch/Figma mediante MCP solo para consultar referencias. No crea, edita, duplica, comenta ni elimina objetos en herramientas externas. Si no dispone de MCP ni puede consultar material verificable, debe devolver un bloqueo.
10. El subagente redacta la sesión en `docs/design-sessions/YYYY-MM-DD-<feature>.md` y la spec versionada en `docs/design-specs/<scope>-v<version>.md`. La spec incluye referencias identificables, pantallas, navegación, tokens o patrones relevantes, criterios visuales, estados, accesibilidad, responsive y diferencias por plataforma.
11. Presenta las rutas, versión, alcance, referencias, diferencias conocidas y preguntas abiertas. La entrega puede estar `DRAFT` o `NEEDS_USER_REVIEW`. Solo después de la aceptación explícita del usuario de esa versión y alcance la conversación principal registra `APPROVED_BY_USER` y la evidencia de aprobación.
12. Un cambio material posterior genera una nueva versión y vuelve a `NEEDS_USER_REVIEW`.

## Límites

- No conviertas una recomendación o un silencio del usuario en una decisión confirmada.
- No interpretes aprobación de la spec funcional como aprobación del diseño.
- No declares que una plataforma quedó validada por haber revisado otra; identifica las adaptaciones web, Android, iPhone y iPad por separado cuando estén en alcance.
- No implementes código de producto ni solicites al subagente que lo haga.
- Mantén las conexiones MCP y credenciales fuera de los documentos del proyecto. Registra nombres de servidores, IDs de archivo/pantalla o referencias compartibles sin incluir secretos ni URLs firmadas.
