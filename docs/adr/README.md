# Registro de Decisiones de Arquitectura (ADRs)

## Golden Starter V3

Este directorio alberga los **Registros de Decisiones de Arquitectura** (_Architectural Decision Records_ - ADR) del proyecto. Cada documento describe formalmente una decisión técnica estructural adoptada, su contexto de negocio, las alternativas evaluadas, y sus ventajas y compromisos.

### Índice de Decisiones Canónicas

| Identificador                                        | Título                                                                                                                       |  Estado  |   Fecha    | Componente Principal                 |
| :--------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------- | :------: | :--------: | :----------------------------------- |
| [`ADR-001`](ADR-001-direct-nextjs.md)                | **Adopción Directa de Next.js** (App Router, RSC, Route Handlers, TypeScript)                                                | ACEPTADO | 2026-09-21 | Frontend Web y Capa API              |
| [`ADR-002`](ADR-002-postgresql-18.md)                | **PostgreSQL 18 como Motor Relacional Primario Estándar** (ACID estricto, JSONB nativo, extensiones enterprise, soporte LTS) | ACEPTADO | 2026-09-21 | Base de Datos y Persistencia         |
| [`ADR-003`](ADR-003-better-auth.md)                  | **Better Auth para Autenticación Multi-Tenant Autónoma sin Vendor Lock-in**                                                  | ACEPTADO | 2026-09-21 | Seguridad, Autenticación y RBAC      |
| [`ADR-004`](ADR-004-private-s3-storage.md)           | **Almacenamiento Privado S3 con URLs Firmadas Temporales para Archivos Protegidos**                                          | ACEPTADO | 2026-09-21 | Almacenamiento y Archivos Protegidos |
| [`ADR-005`](ADR-005-docker-compose-orchestration.md) | **Orquestación con Docker Compose para Staging y Producción en Servidores Existentes**                                       | ACEPTADO | 2026-09-21 | Infraestructura, SRE y Despliegues   |

---

### Gobernanza de Decisiones

1. **Inmutabilidad Histórica:** Los ADRs aceptados no se modifican retroactivamente. Si una decisión cambia, se publica un nuevo ADR que reemplaza o enmienda el anterior (`SUPERSEDED_BY`).
2. **Coordinación:** Toda decisión de arquitectura debe coordinarse con `orchestrator-agent`, el agente de dominio respectivo (`infra-data-agent`, `backend-agent`, `frontend-agent`, `security-agent`, `sre-agent`) y documentarse formalmente por `docs-agent`.
3. **Fuente de Tecnologías:** Las versiones exactas de las librerías se rigen exclusivamente por [`STACK.md`](../../STACK.md).
