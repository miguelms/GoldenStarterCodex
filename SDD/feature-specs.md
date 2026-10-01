# Specs de feature

## Propósito según el método

La spec convierte la intención y los tradeoffs del dueño en un acuerdo duradero de comportamiento, criterios de éxito, límites y restricciones antes de implementar. Cada feature mantiene su propia spec versionada para que otro agente o sesión pueda continuar sin reconstruir el contexto de la conversación.

## Fuente actual

- Plantilla: [`../specs/templates/feature-spec.template.md`](../specs/templates/feature-spec.template.md).
- Convenciones del folder: [`../specs/README.md`](../specs/README.md).
- Features reales: archivos `../specs/<FEATURE-ID>-<slug>.md`.
- Para comportamiento de producto, Q&A y decisiones: `../docs/live-sessions/`.
- Para interfaz: `../docs/design-sessions/` y `../docs/design-specs/`.

**Estado:** **Adoptado como plantilla; parcial en ejecución**. En el checkout inspeccionado no hay specs de feature, solo plantilla y README.

## Contenido mínimo por spec

1. ID, título, estado, owner, rama/base y enlace al repo GitHub confirmado.
2. Problema, objetivo, usuarios/actores, resultado esperado y métricas de éxito cuando existan.
3. Decisiones confirmadas, tradeoffs y restricciones heredadas de la constitución del proyecto.
4. Alcance, fuera de alcance y dependencias.
5. Flujos y reglas en Given/When/Then, incluidos estados vacíos, errores, permisos y casos límite.
6. Criterios de aceptación identificados (AC), verificables y ligados a pruebas/evidencia.
7. Contratos, datos, APIs, privacidad y seguridad afectados.
8. UI: plataformas, estados, accesibilidad, responsive y referencias Stitch/Figma exactas (project/file/screen IDs) que aplican a esta feature.
9. Estrategia de validación y evidencias requeridas.
10. Preguntas abiertas, riesgos y decisiones explícitamente no tomadas.

No copies misión ni stack completos a cada spec. Enlaza la constitución y describe solo las restricciones pertinentes.
