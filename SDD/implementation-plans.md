# Plan de implementación por feature

## Propósito según el método

Después de aprobar una spec, descomponerla en trabajo revisable antes de implementar: dependencias, ownership, secuencia, pruebas, riesgos y condiciones de cierre. Cada feature se trabaja en una rama que parte del commit/base identificados en su spec.

## Fuente actual

- Perfil que puede producirlo: `.codex/agents/change-planner.toml`.
- Destino previsto: `../artifacts/change-plans/`.
- Lista de tareas: `../TASKS.md`.
- Estado actual: directorio de planes con `.gitkeep`; no hay plan activo.

**Estado:** **Parcial**. Hay rol, destino y tareas; falta completar un plan por feature y cerrar una vuelta real.

## Contenido mínimo de un plan

- Feature ID, spec/version aprobada, SHA base y rama objetivo.
- Criterios AC incluidos y excluidos.
- Tareas ordenadas con owner/perfil, rutas de archivos, dependencias y resultado esperado.
- Secuencia TDD por criterio cuando el cambio altera comportamiento: prueba fallida (Red), implementación mínima (Green), refactor con tests verdes.
- Checks por tarea y checks de integración final.
- Datos/migraciones, compatibilidad, seguridad, accesibilidad y plataformas afectadas.
- Riesgos, rollback/recuperación y qué no se va a ejecutar (por ejemplo, operaciones productivas no autorizadas).
- Handoff entre perfiles, estrategia para evitar escrituras concurrentes y evidencia que entrega cada tarea.
- Checklist de diff humano y condición para marcar el plan completo.

El plan no reescribe la spec ni amplía el alcance sin registrar una decisión aprobada.
