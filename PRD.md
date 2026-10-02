# PRD de gobernanza — GoldenStarterCodex

GoldenStarterCodex proporciona una base reutilizable para dirigir el trabajo de aplicaciones mediante agentes Codex, skills, MCP y el método SDD/TDD.

## Capacidades

- Roles especializados con ownership, permisos, handoffs y entregables explícitos.
- Skills reutilizables para preguntas, diseño, especificación, planificación, TDD, QA, seguridad y release.
- Política de uso de MCP basada en capacidades, permisos y límites.
- Flujo SDD/TDD trazable desde decisión hasta spec, plan, implementación, pruebas, evidencia y revisión.
- Gates abstractos que se conectan al perfil técnico de cada aplicación.

## Fuera de alcance

GoldenStarterCodex no mantiene la implementación de Next.js, React, Expo, PostgreSQL, UI, IA, dependencias, Docker ni comandos técnicos. Esas decisiones pertenecen al repositorio de stack declarado por cada aplicación, actualmente GoldenStarterWebIA.

## Instanciación

Una aplicación nueva compone una versión de GoldenStarterCodex con una versión de un stack técnico mediante `.golden/composition.yaml` y `.golden/lock.yaml`. La aplicación mantiene su dominio y sus adaptaciones; cada fuente conserva su ownership.
