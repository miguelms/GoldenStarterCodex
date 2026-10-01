# Ciclo SDD por feature

Este documento operacionaliza el ciclo descrito en el video y las gates ya definidas en `../AGENTS.md`, `../docs/QUALITY.md` y las skills del proyecto.

1. **Confirmar contexto:** abrir el repo/worktree y la rama correctos; validar GitHub URL canónica contra la declarada en la constitución. Leer solo PRD/stack/arquitectura relevantes.
2. **Aclarar y escribir la spec:** llevar el Q&A; registrar decisiones, alcance, no-alcance, AC y pantallas Stitch/Figma pertinentes. Si repo o diseño no están identificados, resolverlo aquí y documentarlo en la constitución o spec correspondiente.
3. **Revisar y aprobar:** el dueño revisa la spec; no se planifica implementación hasta aceptar criterios y límites.
4. **Abrir rama y planificar:** crear rama de feature desde la base declarada; producir plan con tareas, ownership, riesgos, checks y evidencias.
5. **Implementar con TDD:** completar tareas pequeñas; mantener commits pequeños y cambios rastreables; no ampliar scope sin actualizar la spec.
6. **Verificar:** ejecutar checks aplicables según `docs/QUALITY.md`; vincular resultado/evidencia a cada AC; documentar `NOT_RUN` y límites.
7. **Revisar el diff humano:** leer el diff integrado frente a spec y plan; corregir hallazgos; confirmar tests y documentación final. La aprobación de un agente no reemplaza esta revisión.
8. **Merge y cierre:** merge solo por el proceso GitHub acordado por el dueño; registrar el resultado y release por separado. En CCentral, CI no debe desplegar producción si la política del proyecto mantiene el deploy manual.
9. **Replanear:** después del merge, comparar resultado con spec, roadmap, tests y código. Clasificar cada desviación como hueco de spec, defecto de implementación o nuevo trabajo; actualizar el documento canónico afectado y el roadmap antes de iniciar el siguiente ciclo.

## Condición de cierre

Una feature termina el ciclo cuando la spec aprobada, plan, diff revisado y evidencia de AC coinciden; las desviaciones tienen disposición explícita; y la decisión `MERGED`/`NOT_MERGED` queda registrada. `VERIFIED` no significa `RELEASED`.
