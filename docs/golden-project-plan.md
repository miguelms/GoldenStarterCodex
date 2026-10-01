# Golden Project: Starter V2 Baseline Plan

## Propósito

Validar que el starter puede servir como esqueleto sólido, modular y limpio para cualquier nueva aplicación web y móvil, garantizando aislamiento multi-tenant, persistencia relacional con PostgreSQL 18, autenticación con Better-Auth, sincronización outbox offline y perfiles especialistas de Codex.

## Principios del Starter

1. **Agnosticismo de Dominio:** Cero dependencias o conceptos atados a un negocio particular (salud, finanzas, ecommerce). Todo dominio específico se modela como extensión sobre la base.
2. **Fidelidad de Contratos:** Esquemas runtime puros en `packages/contracts` compartidos entre Web y Mobile.
3. **Spec-Driven Development (SDD):** Las funcionalidades nacen en `specs/` con criterios de aceptación antes de escribir código.
4. **Verificación Continua:** Pruebas unitarias, integración, E2E y auditoría de seguridad automatizada.

## Fases de Creación de Nuevas Apps

### Fase 0: Baseline y Configuración
- Monorepo configurado con `@starter/contracts`, `@starter/mobile` y aplicación web en Next.js 16.
- Entorno validado con Node 24 y npm inmutable.
- Catálogo de agentes y skills verificado.

### Fase 1: Especificación de la Feature (SDD)
- Conducción de sesión de especificación con `product-manager-agent`.
- Creación del archivo de spec bajo `specs/` con scorecard de aceptación.
- Descomposición en tareas atómicas en `TASKS.md` por `change-planner-agent`.

### Fase 2: Implementación por Especialistas
- `infra-data-agent`: Esquemas relacionales y migraciones Drizzle.
- `backend-agent`: Lógica de dominio y Route Handlers con validación Zod.
- `frontend-agent` y `mobile-agent`: Interfaces web y móviles consumiendo contratos puros.

### Fase 3: Verificación Independiente
- `test-engineer-agent`: Suites de pruebas automáticas cubriendo los criterios del Scorecard.
- `qa-agent`: Revisión de evidencia sin modificar código.
- `security-agent`: Auditoría de aislamiento multi-tenant, sanitización y secretos.
