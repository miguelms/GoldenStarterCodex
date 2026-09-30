# Guía de Uso y Evolución de Golden Starter V3

Esta guía contiene las instrucciones operativas completas para instanciar nuevas aplicaciones a partir de **Golden Starter V3 (GSv3)**, la metodología para evolucionar la plantilla base sin contaminarla, y la hoja de ruta de mejoras recomendadas.

---

## 🚀 ¿Cómo usar GoldenStarterV3 para una nueva app?

La rama principal **`main`** de este repositorio es el **Golden Starter canónico** (100% agnóstico y libre de lógica de un negocio específico).

Para iniciar una nueva aplicación en una carpeta limpia (por ejemplo `MiNuevaApp`):

```bash
# 1. Clonas el repositorio directamente en el destino que desees:
git clone git@github.com:miguelms/GoldenStarterV3.git /ruta/a/MiNuevaApp
# O desde tu ruta local si estás en la misma máquina:
# git clone /Users/mm/Downloads/m-work/Projects/customAgents/Rstate-GSv2 /ruta/a/MiNuevaApp

# 2. Entras a la carpeta de la nueva aplicación:
cd /ruta/a/MiNuevaApp

# 3. Desvinculas el repositorio origen para crear tu propio repositorio Git nuevo:
git remote remove origin
# git remote add origin git@github.com:tu-usuario/mi-nueva-app.git

# 4. Instalas dependencias
npm install

# 5. Configuras variables de entorno
cp .env.example .env

# 6. Levantas la app en modo desarrollo
npm run dev
```

> [!TIP]
> Al clonar la rama `main`, la nueva aplicación parte de un estado **100% limpio**: sin tablas de bienes raíces, sin lógica residual, pero con toda la arquitectura lista (BFF, Auth, Drizzle, Shadcn UI, microservicio de IA, contratos compartidos y los 17 agentes de Antigravity).

---

## 🔄 ¿Cómo seguir mejorando GoldenStarterV3? (Metodología y Pasos)

Para que GoldenStarterV3 siga evolucionando como una plantilla de clase mundial:

### PASO 1: Crea una rama de feature limpia desde `main`
Antes de hacer cualquier mejora genérica o estructural:
```bash
git checkout main
git pull origin main
git checkout -b feat/nombre-de-la-mejora
```

---

### PASO 2: Define la mejora con la metodología SDD (Spec-Driven Development)
No programes "a ciegas". Si vas a añadir una mejora estructural:
1. Crea un archivo de especificación en `specs/` (ejemplo: `specs/003-oauth-social.md`) basándote en la plantilla [`specs/templates/feature-spec.template.md`](file:///Users/mm/Downloads/m-work/Projects/customAgents/Rstate-GSv2/specs/templates/feature-spec.template.md).
2. Si la mejora implica un cambio arquitectónico (ejemplo: cambiar el broker de Redis, agregar streaming con SSE o un nuevo proveedor de base de datos), crea un registro de decisión arquitectónica en `docs/adr/` (ejemplo: `docs/adr/ADR-006-sse-streaming.md`).
3. Define los criterios de aceptación con formato Given / When / Then y el scorecard verificable.

---

### PASO 3: Invoca o asigna a los agentes especializados de Antigravity
Utiliza el agente adecuado según el alcance del cambio. Todos los agentes están configurados en `.agents/agents/` y son descubiertos automáticamente por Antigravity:

| Agente Especialista | Rol en GoldenStarterV3 |
| :--- | :--- |
| `orchestrator-agent` | Coordina la ejecución y verifica que se cumplan los gates del Golden Starter. |
| `change-planner-agent` | Descompone la especificación en tareas atómicas y las registra en `TASKS.md`. |
| `backend-agent` | Implementa endpoints de API en `src/app/api`, lógica de servidor o microservicio Flask en `backend-ai/`. |
| `frontend-agent` | Implementa pantallas, layouts o componentes UI con React 19, Tailwind CSS 4 y Shadcn. |
| `infra-data-agent` | Modifica schemas Drizzle (`src/db/schema.ts`) y genera migraciones SQL para PostgreSQL 18. |
| `mobile-agent` | Mantiene la sincronización con la app móvil Expo (`apps/mobile/`). |
| `security-agent` | Revisa políticas de sesión Better Auth, permisos de S3, tokens y sanitización Zod. |
| `test-engineer-agent` | Escribe pruebas unitarias (Vitest), de integración y E2E (Playwright). |
| `qa-agent` | Valida de forma independiente que los criterios de aceptación pasen al 100%. |

---

### PASO 4: Ejecuta los Quality Gates obligatorios
Antes de considerar terminada cualquier mejora, deben ejecutarse y aprobarse todos los checks del Golden Starter:

```bash
# 1. Comprobación estricta de tipos TypeScript (sin `any`)
npm run typecheck

# 2. Suite de pruebas unitarias con Vitest
npm run test:unit

# 3. Validación de los 17 agentes de Antigravity
npm run check:agents

# 4. Verificación de linter y formato
npm run lint
```

*(Si alguno de estos comandos falla o arroja un código distinto de 0, bloquea la integración hasta corregirlo).*

---

### PASO 5: Guarda y publica la mejora
Una vez superados todos los quality gates:
```bash
git add .
git commit -m "feat(core): agregar soporte de <nombre-de-la-mejora>"
git push origin GoldenStarterV3
```

---

## 🗺️ Roadmap de Mejoras Sugeridas de Alto Valor para GSv3

Si quieres llevar GoldenStarterV3 al siguiente nivel, aquí tienes las mejoras más recomendadas clasificadas por impacto:

### 1. Autenticación Social (OAuth)
- **Objetivo**: Habilitar inicio de sesión con un clic usando Google y GitHub.
- **Implementación**: Configurar los proveedores en Better Auth (`src/lib/auth.ts`) y crear los botones correspondientes en `src/app/login/page.tsx` usando Shadcn UI.
- **Beneficio**: Cualquier nueva app creada con GSv3 tendrá autenticación moderna lista para producción sin escribir código extra.

### 2. Server-Sent Events (SSE) o Streaming de IA
- **Objetivo**: Transmitir tokens de respuesta de LLMs o transcripciones en tiempo real mientras se generan, en lugar de sondeo (`polling`) repetitivo.
- **Implementación**: Configurar un generador SSE en Flask (`backend-ai/app.py`) o un Route Handler con streaming en Next.js (`src/app/api/ai/stream/route.ts`).
- **Beneficio**: Experiencia de usuario ultra-rápida y menor sobrecarga de peticiones HTTP en el microservicio.

### 3. Pipeline CI/CD en GitHub Actions
- **Objetivo**: Validar automáticamente cada Pull Request antes de fusionar.
- **Implementación**: Crear `.github/workflows/ci.yml` ejecutando `npm ci`, `npm run typecheck`, `npm run test:unit` y `npm run check:agents`.
- **Beneficio**: Garantía absoluta de que ninguna rama ni contribución externa rompa los estándares de calidad del starter.

### 4. Caché y Rate Limiting con Redis
- **Objetivo**: Proteger los endpoints públicos del BFF y acelerar respuestas frecuentes.
- **Implementación**: Conectar el servicio `redis` existente en `docker-compose.yml` al BFF Next.js vía `ioredis` para limitar tasa de peticiones y almacenar en caché datos de sólo lectura.
- **Beneficio**: Resistencia a ataques de denegación de servicio (DoS) y menor latencia en aplicaciones de alto tráfico.

### 5. Exportación e Importación en GenericCrudDataGrid
- **Objetivo**: Permitir exportar tablas a CSV/Excel y carga masiva de registros.
- **Implementación**: Añadir botones de acción en `src/components/shared/GenericCrudDataGrid.tsx` con soporte para parseo y validación de esquemas Zod en cliente y servidor.
- **Beneficio**: Acelera dramáticamente el desarrollo de paneles administrativos y herramientas internas tipo SaaS.

### 6. Notificaciones Push y Webhooks
- **Objetivo**: Enviar alertas asíncronas a usuarios web y móviles tras la finalización de tareas pesadas de IA.
- **Implementación**: Tarea Celery que al finalizar notifica vía webhook o Expo Push Notifications.
- **Beneficio**: Cierra el ciclo entre procesamiento asíncrono en background y aviso en tiempo real al usuario.
