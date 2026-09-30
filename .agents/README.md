# Catálogo de Custom Agents y Skills — Antigravity

> Equipo de 17 agentes autónomos especializados para **Golden Starter V3**.

Esta carpeta está ubicada en la raíz del repositorio (`.agents/`) conforme a la convención canónica de Google Antigravity para el autodescubrimiento de agentes por proyecto.

---

## 👥 Especialistas Disponibles

1. **`orchestrator-agent`**: Coordina especialistas, integra resultados y aplica los gates del golden project.
2. **`product-manager-agent`**: Conduce sesiones Q&A y convierte decisiones en especificaciones SDD verificables.
3. **`change-planner-agent`**: Diseña planes de cambio de impacto acotado y trazable.
4. **`backend-agent`**: Implementa contratos puros, lógica de negocio, BFF y Route Handlers en Next.js.
5. **`frontend-agent`**: Implementa la interfaz web React 19 / Next.js con Shadcn UI y Generic DataGrid.
6. **`ui-ux-designer-agent`**: Define especificaciones de diseño, accesibilidad y flujos de usuario.
7. **`mobile-agent`**: Implementa la app React Native / Expo 57 con soporte offline.
8. **`infra-data-agent`**: Diseña schemas PostgreSQL 18, migraciones Drizzle y persistencia transaccional.
9. **`devops-agent`**: Gestiona Docker Compose, redes internas y empaquetado de contenedores.
10. **`sre-agent`**: Monitorea salud, métricas, mitigación de fallos y runbooks.
11. **`security-agent`**: Audita autorización, secretos, superficie de ataque y dependencias.
12. **`qa-agent`**: Revisa de forma independiente cambios integrados y evidencia sin modificar código.
13. **`test-engineer-agent`**: Convierte invariantes en pruebas unitarias Vitest, integración y Playwright E2E.
14. **`debugger-regression-agent`**: Reproduce fallos y crea pruebas de regresión.
15. **`docs-agent`**: Mantiene la documentación técnica alineada con el código.
16. **`platform-release-agent`**: Gestiona dependencias compartidas, scripts, lockfile y CI.
17. **`repo-explorer-agent`**: Mapea repositorios y dependencias sin modificar archivos.

---

## 🧪 Validación

Para validar la integridad de todos los agentes y sus contratos:
```bash
npm run check:agents
```
