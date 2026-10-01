# [FEATURE-ID]: [Nombre de la Funcionalidad]

> Estado: `DRAFT | APPROVED_BY_USER | IN_PROGRESS | VERIFIED | RELEASED`  
> Owner: `product_manager` (Codex subagent)
> Metodología: Spec-Driven Development (SDD)

---

## 1. Visión y Caso de Uso (User Story)

- **Como:** [Rol de usuario o actor del sistema]
- **Quiero:** [Acción o capacidad requerida]
- **Para:** [Resultado de negocio u objetivo operativo]

---

## 2. Especificación de Comportamiento (Given / When / Then)

### Escenario 1: Flujo Exitoso Principal
- **Given:** [Precondición del sistema o estado de datos inicial]
- **When:** [Acción ejecutada por el usuario o evento recibido]
- **Then:** [Resultado esperado, mutación de estado y respuesta devuelta]

### Escenario 2: Límite / Validación / Error
- **Given:** [Contexto con datos inválidos o estado no autorizado]
- **When:** [Se intenta ejecutar la acción]
- **Then:** [El sistema rechaza con código de error específico y mensaje tipado]

---

## 3. Contratos Afectados (`packages/contracts`)

- [ ] ¿Requiere nuevo esquema Zod? (`packages/contracts/src/index.ts`)
- [ ] ¿Requiere modificación de contratos existentes? (Verificar retrocompatibilidad)
- [ ] Tipos exportados para Web y Mobile:
  ```typescript
  // Declarar los contratos aquí antes de escribir código en src/ o apps/mobile
  ```

---

## 4. Scorecard de Criterios de Aceptación (Verificación Automática)

*Todo criterio debe ser verificable mediante pruebas automáticas ejecutables.*

| ID Criterio | Descripción Verificable | Tipo de Test | Archivo de Prueba | Estado |
| :--- | :--- | :--- | :--- | :--- |
| **AC-001** | [Criterio 1: ej. Retorna 200 y estructura válida] | Unit / Integration | `tests/unit/...` | [ ] PENDING |
| **AC-002** | [Criterio 2: ej. Aislamiento por organizationId] | Security / Unit | `tests/unit/...` | [ ] PENDING |
| **AC-003** | [Criterio 3: ej. Manejo offline / idempotencia] | Integration | `tests/integration/...` | [ ] PENDING |

---

## 5. Fuera de Alcance (Límites Estrictos para Evitar Drift)

*Lista explícita de lo que los agentes NO deben implementar en esta iteración:*
- [ ] [Ejemplo: Notificaciones push automáticas]
- [ ] [Ejemplo: Migración masiva de registros históricos]
