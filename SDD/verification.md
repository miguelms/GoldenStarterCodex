# Verificación y evidencia

## Propósito según el método

La verificación demuestra que la implementación satisface la spec y los AC. El estado no se infiere de que el código compile o de una afirmación del agente: se registran comandos, entorno, resultado y límites de cada check.

## Fuentes actuales

- Reglas y comandos: [`../docs/QUALITY.md`](../docs/QUALITY.md).
- Instrucciones SDD/TDD de Codex: [`../AGENTS.md`](../AGENTS.md).
- AC y prueba asociada: [`../specs/templates/feature-spec.template.md`](../specs/templates/feature-spec.template.md).
- Suites: `../tests/unit/`, `../tests/integration/`, `../tests/e2e/`.
- Evidencia: `../artifacts/results/` y contrato `../docs/contrato-resultados.md`.

**Estado:** **Adoptado como estándar documental; parcial por feature**. `QUALITY.md` describe checks del starter y `AGENTS.md` exige TDD para cambios de comportamiento. Cada spec/plan aún debe mapear sus AC a checks concretos.

## Evidencia por AC

Para cada AC registra:

| Campo | Contenido esperado |
| --- | --- |
| AC | ID y criterio cubierto |
| Prueba | Archivo/suite o inspección humana aplicable |
| Comando/entorno | Comando real, cwd, versiones, servicios y plataforma |
| Resultado | `PASS`, `FAIL`, `NOT_RUN`, `NOT_APPLICABLE` con justificación cuando aplique |
| Evidencia | Log, reporte, URL/identificador de CI o pasos reproducibles |
| Límites | Qué no valida ese resultado |

## Política

- Mantén separados resultados locales y CI; no presentes un check no ejecutado como aprobado.
- TDD (Red → Green → Refactor) es una regla del proyecto documentada en `AGENTS.md`; el video aporta la exigencia de pruebas y validación basada en evidencia.
- Una revisión visual aprobada no prueba accesibilidad o comportamiento de plataforma que no se haya ejercitado.
- Un build verde no autoriza ni ejecuta un despliegue.
