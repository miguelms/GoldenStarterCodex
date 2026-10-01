# Módulo SDD — Spec-Driven Development

> Metodología oficial de desarrollo guiado por especificaciones para **Golden Starter V3**.

Este directorio aloja todas las especificaciones formales de requerimientos antes de escribir código.

---

## 📁 Contenido del Directorio

- **`templates/feature-spec.template.md`**: Plantilla oficial para redactar nuevas especificaciones con:
  - Casos de uso (*User Story*).
  - Escenarios ejecutables en formato **Given / When / Then**.
  - Scorecard de Criterios de Aceptación con ID único (`AC-001`, `AC-002`, etc.) mapeados a pruebas automáticas.
  - Límites de alcance (*Out of Scope*) para evitar desvíos (*agent drift*).

---

## 🚀 Flujo de Trabajo

1. Al planear una nueva funcionalidad, copia la plantilla:
   ```bash
   cp specs/templates/feature-spec.template.md specs/FEAT-001-mi-funcionalidad.md
   ```
2. Completa los criterios de aceptación y los escenarios de prueba.
3. Delega el trabajo al perfil especialista apropiado de `.codex/agents/` y conserva los criterios de aceptación de esta spec como límite de implementación.
