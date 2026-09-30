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

## 🚀 ¿Cómo usar GoldenStarterV3 para una nueva app?

Para iniciar una nueva aplicación en una carpeta limpia (ej. `MiNuevaApp`):

```bash
# 1. Clonas el repositorio directamente (la rama principal 'main' ya es el Golden Starter limpio):
git clone git@github.com:miguelms/GoldenStarterV3.git MiNuevaApp
# O localmente:
# git clone /Users/mm/Downloads/m-work/Projects/customAgents/Rstate-GSv2 MiNuevaApp

# 2. Entras a la carpeta de la nueva app:
cd MiNuevaApp

# 3. Desvinculas el remote original para conectar tu propio repositorio nuevo:
git remote remove origin
# git remote add origin git@github.com:tu-usuario/mi-nueva-app.git

# 4. Instalas dependencias y configuras variables de entorno:
npm install
cp .env.example .env
npm run dev
```

---

## 🔄 ¿Cómo seguir mejorando GoldenStarterV3? (Metodología y Pasos)

Para que GoldenStarterV3 siga evolucionando como una plantilla de clase mundial:

### PASO 1: Crea una rama de feature limpia desde `main`
Antes de hacer cualquier mejora genérica:
```bash
git checkout main
git pull origin main
git checkout -b feat/nombre-de-la-mejora
```

### PASO 2: Define la mejora con la metodología SDD (Spec-Driven Development)
No programes "a ciegas". Si vas a añadir una mejora estructural:
1. Crea una especificación en `specs/` (ej. `specs/003-oauth-social.md`) usando [`specs/templates/feature-spec.template.md`](file:///Users/mm/Downloads/m-work/Projects/customAgents/Rstate-GSv2/specs/templates/feature-spec.template.md).
2. Si afecta contratos o arquitectura base, regístralo en `docs/adr/`.
3. Establece los criterios Given / When / Then y scorecard de aceptación.

### PASO 3: Invoca o asigna a los agentes especializados de Antigravity
Delega cada parte a su especialista:
- `change-planner-agent`: Planifica el desglose en `TASKS.md`.
- `backend-agent`: Implementa endpoints en `src/app/api` o microservicio en `backend-ai/`.
- `frontend-agent`: Implementa componentes UI con React 19, Tailwind CSS 4 y Shadcn.
- `infra-data-agent`: Schemas Drizzle y migraciones en PostgreSQL 18.
- `mobile-agent`: Actualiza o verifica la app Expo en `apps/mobile/`.
- `security-agent`: Audita autenticación, secretos y validaciones Zod.
- `test-engineer-agent`: Escribe tests Vitest y Playwright.
- `qa-agent`: Verifica de forma independiente los criterios de aceptación.

### PASO 4: Ejecuta los Quality Gates obligatorios
Antes de dar por buena la mejora, ejecuta:
```bash
npm run typecheck       # 0 errores de tipado TypeScript
npm run test:unit       # 100% pruebas unitarias pasando
npm run check:agents    # 17 agentes validados en Antigravity
npm run lint            # Estándar de código limpio
```

### PASO 5: Persiste y publica la mejora
```bash
git add .
git commit -m "feat(core): agregar soporte de <mejora>"
git push origin GoldenStarterV3
```

---

## 🗺️ Roadmap de Mejoras Sugeridas de Alto Valor para GSv3

1. **Autenticación Social (OAuth)**:
   - Configurar proveedores Google y GitHub en Better Auth para que cualquier app nueva ya tenga inicio de sesión con un clic.
2. **Server-Sent Events (SSE) o Streaming de IA**:
   - Permitir que el microservicio Flask o Next.js transmitan tokens de texto o transcripciones en tiempo real mientras se generan, en lugar de solo sondeo (`polling`).
3. **Pipeline CI/CD en GitHub Actions**:
   - Automatizar en `.github/workflows/ci.yml` la ejecución de `typecheck`, `test:unit`, `check:agents` y build en cada Pull Request.
4. **Caché y Rate Limiting con Redis**:
   - Proteger endpoints públicos y acelerar lecturas frecuentes mediante Redis.
5. **Exportación e Importación en GenericCrudDataGrid**:
   - Soporte para exportar a CSV/Excel e importación masiva con validación por Zod.
6. **Notificaciones Push y Webhooks**:
   - Notificaciones asíncronas móviles (Expo) y webhooks configurables al terminar tareas pesadas de Celery.

---

> Para la guía operativa detallada, consulta [`docs/guides/how-to-use-and-extend-gsv3.md`](file:///Users/mm/Downloads/m-work/Projects/customAgents/Rstate-GSv2/docs/guides/how-to-use-and-extend-gsv3.md).
