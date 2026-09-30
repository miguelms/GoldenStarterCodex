# Golden Starter V3 — Enterprise Monorepo Skeleton

> Plantilla canónica de referencia para el desarrollo acelerado de aplicaciones web y móviles de nivel empresarial bajo el patrón **Backend for Frontend (BFF)**, soporte offline, arquitectura multi-tenant y desarrollo guiado por especificaciones (**Spec-Driven Development**).

---

## 🚀 Tecnologías Principales

- **Frontend & Orquestador (BFF)**: Next.js 16 (App Router) + React 19 + Tailwind CSS 4 + Shadcn UI
- **Microservicio Satélite de IA**: Python 3.12 + Flask + Celery + Redis (red interna aislada)
- **Mobile**: Expo SDK 57 + React Native 0.86 + Hermes + Expo Router
- **Persistencia**: PostgreSQL 18 + Drizzle ORM (multi-tenant estricto)
- **Autenticación**: Better Auth 1.7.5 con Drizzle Adapter y control de sesiones
- **Contratos Compartidos**: Zod 4.6 en `@starter/contracts` (Web y Mobile)
- **Almacenamiento**: AWS S3 con fallback de almacenamiento local seguro
- **Componentes Estándar**: Shadcn UI oficial + `GenericCrudDataGrid` responsivo
- **Agentes Autónomos**: Catálogo de 17 agentes de IA Antigravity especializados
- **Metodología**: Spec-Driven Development (SDD) con scorecards ejecutables

---

## 📁 Estructura Modular del Repositorio

El repositorio está organizado en carpetas modulares que separan estrictamente las responsabilidades de cada componente del sistema:

```text
├── .agents/                 📁 FOLDER DE CUSTOM AGENTS
│   ├── agents/              └── Los 17 agentes especializados (agent.md de cada uno)
│   └── skills/              └── Skills ejecutables de Antigravity
│
├── specs/                   📁 FOLDER DE SDD (Spec-Driven Development)
│   └── templates/           └── Plantillas Given/When/Then y scorecards de aceptación
│
├── backend-ai/              📁 FOLDER DEL MICROSERVICIO SATÉLITE IA
│   ├── app.py               └── Servidor Flask (red interna Docker)
│   ├── celery_app.py        └── Fábrica Celery con Redis broker
│   ├── tasks.py             └── Tareas asíncronas de IA con SDKs en la nube
│   ├── Dockerfile           └── Contenedor Python 3.12 aislado
│   └── requirements.txt     └── Dependencias de Flask, Celery y SDKs cloud
│
├── packages/contracts/      📁 FOLDER DE CONTRATOS COMPARTIDOS
│   └── src/index.ts         └── Tipos y esquemas Zod puros (Web y Móvil)
│
├── apps/mobile/             📁 FOLDER DE LA APP MÓVIL
│   └── ...                  └── Expo 57 / React Native con SQLite offline
│
├── src/                     📁 FOLDER DE LA APLICACIÓN WEB & BFF (Next.js 16)
│   ├── app/                 └── Rutas y páginas (App Router) + API Routes
│   ├── components/ui/       └── Componentes Shadcn UI (Button, Card, Input, Label, Textarea)
│   ├── components/shared/   └── Generic DataGrid y componentes transversales
│   ├── db/                  └── Schemas de PostgreSQL 18 y Drizzle ORM
│   ├── server/              └── Cliente BFF del satélite IA y lógica de sesión
│   └── lib/                 └── Utilidades canónicas (cn, auth, storage S3)
│
├── tests/                   📁 FOLDER DE PRUEBAS AUTOMATIZADAS
│   ├── unit/                └── Vitest (esquemas, storage, lógica)
│   ├── integration/         └── Pruebas de integración
│   └── e2e/                 └── Playwright (navegador real)
│
├── docs/                    📁 FOLDER DE DOCUMENTACIÓN TÉCNICA
│   ├── adr/                 └── Architecture Decision Records (ADR-001 a 005)
│   ├── architecture/        └── Guías arquitectónicas
│   ├── operations/          └── Runbooks de SRE y despliegue
│   └── QUALITY.md           └── Estándares de calidad y comandos
│
└── drizzle/                 📁 FOLDER DE MIGRACIONES SQL
    └── 0000_stormy_cloak.sql└── Migración autogenerada para PostgreSQL 18
```

---

## 🛠️ Comandos de Desarrollo

```bash
# Iniciar servidor de desarrollo web
npm run dev

# Ejecutar suite de pruebas unitarias (Vitest)
npm run test:unit

# Verificar tipos TypeScript en web y contratos
npm run typecheck

# Validar catálogo de 17 agentes Antigravity
npm run check:agents

# Verificar cliente móvil Expo
npm run check:mobile

# Linter de código
npm run lint

# Generar y aplicar migraciones de base de datos (PostgreSQL 18)
npm run db:generate
npm run db:migrate

# Levantar infraestructura completa con Docker Compose
docker compose up -d
```

---

## 📋 Flujo de Trabajo con Agentes (SDD)

Para implementar nuevas funcionalidades, sigue el flujo **Spec-Driven Development**:
1. Crea la especificación de la feature en `specs/` usando `specs/templates/feature-spec.template.md`.
2. `product-manager-agent` valida los requisitos y criterios de aceptación.
3. `change-planner-agent` descompone en tareas atómicas en `TASKS.md`.
4. `backend-agent`, `frontend-agent` o `mobile-agent` implementan respetando `@starter/contracts`.
5. `test-engineer-agent` y `qa-agent` verifican los criterios antes de dar por completada la tarea.
