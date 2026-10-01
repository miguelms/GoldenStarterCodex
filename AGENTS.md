# GoldenStarter Codex — instrucciones del proyecto

## Fuentes del proyecto

- Stack y versiones: `STACK.md`.
- Requisitos generales: `PRD.md`.
- Arquitectura y seguridad: `ARCHITECTURE.md`.
- Especificaciones activas: `specs/`.
- Ownership y perfiles: `docs/agent-registry.md` y `.codex/agents/`.
- Checks y evidencia: `docs/QUALITY.md` y `docs/contrato-resultados.md`.

Consulta solo lo necesario para la tarea actual.

## Flujo de trabajo

- La conversación principal de Codex coordina el trabajo según este archivo; no existe un perfil TOML `orchestrator` duplicado. Mantén con el usuario las decisiones de producto y diseño.
- Para alcance o reglas de negocio sin resolver, usa `$live-product-qa`; después de que el usuario confirme decisiones, delega la spec `DRAFT` a `product_manager`. No implementes cambios de producto sin spec aprobada y criterios verificables.
- Para interfaz nueva o cambios visuales, usa `$live-design-review`; delega artefactos al perfil `ui_ux_designer`. Requiere aprobación visual por cada plataforma antes de que `frontend` o `mobile` implemente.
- Para cambios entre módulos o cuando se solicite planificación técnica, delega `change_planner` después de aprobar la spec. Elige implementadores y revisores según `docs/agent-registry.md`; perfiles especializados contienen sus instrucciones completas.
- Si el flujo o el ownership no está claro, usa primero `repo_explorer` en solo lectura. Entrega a cada subagente objetivo, criterios, rutas permitidas, base/referencia, checks y evidencia esperada. Evita escritores concurrentes en archivos compartidos.
- Usa `test_engineer` para cobertura, `debugger_regression` para reproducir fallos antes del fix, `qa` para revisión independiente de cambios integrados y `security` para auditorías. Usa `docs`, `platform_release`, `devops` y `sre` para sus áreas registradas.
- Para cambios de comportamiento, aplica SDD y TDD (Red → Green → Refactor) por criterio. Ejecuta solo checks aplicables de `docs/QUALITY.md`; informa resultados reales y no marques `PASS` sin evidencia.

## Seguridad y operaciones

- Conserva cambios preexistentes del usuario; no uses `git restore`, `git reset` ni `git stash` para limpiar el checkout sin instrucción explícita.
- Usa datos sintéticos para pruebas; no expongas secretos ni datos sensibles en código, logs o artifacts.
- No conectes a producción ni publiques, despliegues, restaures datos o cambies servicios externos sin autorización explícita para la acción y el entorno. Un CI exitoso, perfil de release o runbook no autoriza por sí solo un despliegue.
- `COMPLETED` no significa `RELEASED`; documenta bloqueos, `NOT_RUN` y límites según `docs/contrato-resultados.md`.
