# Sesión — separación de gobernanza y stack técnico

Fecha: 2026-10-02 (America/Tijuana)

## Decisión confirmada

GoldenStarterCodex será la fuente de gobernanza: custom agents, subagents, skills, MCP, SDD/TDD, templates, gates y evidencia. GoldenStarterWebIA será la fuente del stack técnico web con IA: dependencias, UI, backend, contratos, infraestructura, pruebas, CI y release.

Una aplicación nueva compondrá una versión de cada repositorio mediante `.golden/composition.yaml` y `.golden/lock.yaml`. Las actualizaciones se revisan y publican de forma independiente.

## Estado de esta sesión

- Se creó el checkout local inicial de GoldenStarterWebIA desde la base técnica disponible.
- Se añadió su contrato de ownership y README.
- Se retiró del checkout Codex la implementación técnica y se conservó su gobernanza.
- Se añadió el runbook de composición y la spec FEAT-003.
- CCentral no se modificó.
- GoldenStarterAntigravity no se modificó.

## Pendiente antes de declarar release

- Ejecutar validaciones independientes en ambos repositorios.
- Revisar el diff de separación.
- Crear commits y publicar ambos repositorios en GitHub.
- Confirmar que los workflows remotos estén verdes.
