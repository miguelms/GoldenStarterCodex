# Golden Starter Codex — Enterprise Monorepo Skeleton

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
- **Asistencia especializada**: Perfiles de subagentes Codex en `.codex/agents/` y skills reutilizables en `.agents/skills/`
- **Metodología**: Spec-Driven Development (SDD) con scorecards ejecutables

---

## 📁 Estructura actual del repositorio

El mapa completo, la ubicación canónica de cada artefacto SDD y el estado de adopción están en [`SDD/README.md`](SDD/README.md). Esta es la estructura principal observada:

```text
├── .agents/skills/           Skills de producto, diseño y despliegue
├── .codex/agents/            Perfiles TOML nativos de Codex
├── apps/mobile/              Expo / React Native
├── artifacts/                Planes de cambio, debug, reportes y resultados
├── backend-ai/               Flask, Celery, Redis e integraciones cloud
├── docs/                     ADRs, operaciones, seguridad, sesiones y calidad
├── drizzle/                  Migraciones y snapshots de PostgreSQL
├── packages/contracts/       Contratos compartidos Zod
├── specs/templates/          Plantilla SDD de feature
├── src/                      Next.js/BFF, componentes, DB, dominio y utilidades
├── tests/                    Suites unitarias, integración y E2E
├── SDD/                      Mapa de cumplimiento y ciclo SDD
├── AGENTS.md                 Instrucciones permanentes de Codex
├── PRD.md / STACK.md         Propósito, capacidades y stack
└── ARCHITECTURE.md           Arquitectura y tradeoffs
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

## 🚀 ¿Cómo usar GoldenStarterCodex para una nueva app?

Para iniciar una nueva aplicación en una carpeta limpia (ej. `MiNuevaApp`):

```bash
# 1. Clona GoldenStarterCodex desde GitHub:
git clone https://github.com/miguelms/GoldenStarterCodex.git MiNuevaApp

# 2. Entras a la carpeta de la nueva app:
cd MiNuevaApp

# 3. Conecta el repositorio nuevo de la app:
git remote remove origin
# git remote add origin git@github.com:tu-usuario/mi-nueva-app.git

# 4. Instalas dependencias y configuras variables de entorno:
npm install
cp .env.example .env
npm run dev
```

---

## 🔄 ¿Cómo seguir mejorando GoldenStarterCodex? (Metodología y Pasos)

Para que GoldenStarterCodex siga evolucionando como una plantilla reutilizable:

### PASO 1: Crea una rama de feature limpia desde `main`
Antes de hacer cualquier mejora genérica:
```bash
git checkout main
git pull origin main
git checkout -b feat/nombre-de-la-mejora
```

### PASO 2: Define la mejora con la metodología SDD (Spec-Driven Development)
No programes "a ciegas". Si vas a añadir una mejora estructural:
1. Crea una especificación en `specs/` (ej. `specs/003-oauth-social.md`) usando [`specs/templates/feature-spec.template.md`](specs/templates/feature-spec.template.md).
2. Si afecta contratos o arquitectura base, regístralo en `docs/adr/`.
3. Establece los criterios Given / When / Then y scorecard de aceptación.

### PASO 3: Delega a los perfiles especialistas de Codex
Usa el perfil apropiado desde `.codex/agents/` según el alcance:
- `change_planner`: Planifica el desglose en `TASKS.md`.
- `backend`: Implementa endpoints en `src/app/api` o microservicio en `backend-ai/`.
- `frontend`: Implementa componentes UI con React 19, Tailwind CSS 4 y Shadcn.
- `infra_data`: Schemas Drizzle y migraciones en PostgreSQL 18.
- `mobile`: Actualiza o verifica la app Expo en `apps/mobile/`.
- `security`: Audita autenticación, secretos y validaciones Zod.
- `test_engineer`: Escribe tests Vitest y Playwright.
- `qa`: Verifica de forma independiente los criterios de aceptación.

### PASO 4: Ejecuta los Quality Gates obligatorios
Antes de dar por buena la mejora, ejecuta:
```bash
npm run typecheck       # 0 errores de tipado TypeScript
npm run test:unit       # 100% pruebas unitarias pasando
npm run lint            # Estándar de código limpio
```

### PASO 5: Persiste y publica la mejora
```bash
git add .
git commit -m "feat(core): agregar soporte de <mejora>"
git push -u origin feat/nombre-de-la-mejora
```

---

## 🗺️ Roadmap de Mejoras Sugeridas de Alto Valor para GSv3

1. **Autenticación Social (OAuth)**:
   - Configurar proveedores Google y GitHub en Better Auth para que cualquier app nueva ya tenga inicio de sesión con un clic.
2. **Server-Sent Events (SSE) o Streaming de IA**:
   - Permitir que el microservicio Flask o Next.js transmitan tokens de texto o transcripciones en tiempo real mientras se generan, en lugar de solo sondeo (`polling`).
3. **Pipeline CI en GitHub Actions**:
   - Automatizar en `.github/workflows/ci.yml` la ejecución de `typecheck`, `test:unit` y build en cada Pull Request. El workflow no despliega producción.
4. **Caché y Rate Limiting con Redis**:
   - Proteger endpoints públicos y acelerar lecturas frecuentes mediante Redis.
5. **Exportación e Importación en GenericCrudDataGrid**:
   - Soporte para exportar a CSV/Excel e importación masiva con validación por Zod.
6. **Notificaciones Push y Webhooks**:
   - Notificaciones asíncronas móviles (Expo) y webhooks configurables al terminar tareas pesadas de Celery.

---

> Para la guía operativa detallada, consulta [`docs/guides/how-to-use-and-extend-gsv3.md`](docs/guides/how-to-use-and-extend-gsv3.md).
