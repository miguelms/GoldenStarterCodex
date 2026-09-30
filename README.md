# Golden Starter V2 — Enterprise Monorepo Skeleton

> Plantilla canónica de referencia para el desarrollo acelerado de aplicaciones web y móviles de nivel empresarial con soporte offline, arquitectura multi-tenant y desarrollo guiado por especificaciones (Spec-Driven Development).

## 🚀 Tecnologías Principales

- **Web**: Next.js 16 (App Router) + React 19 + Tailwind CSS 4
- **Mobile**: Expo SDK 57 + React Native 0.86 + Hermes + Expo Router
- **Persistencia**: PostgreSQL 18 + Drizzle ORM
- **Autenticación**: Better-Auth 1.7.5 con RBAC multi-tenant
- **Contratos Compartidos**: Zod 4.6 en `@starter/contracts`
- **Almacenamiento**: Abstracción Local + AWS S3 (@aws-sdk/client-s3)
- **Monitoreo & Logs**: Logger estructurado con redacción automática de secretos
- **Agentes**: Catálogo de 17 agentes de IA Antigravity especializados

## 📁 Estructura del Proyecto

```text
├── apps/
│   └── mobile/              # App móvil en Expo SDK 57 (React Native / Hermes)
├── packages/
│   └── contracts/           # Contratos puros en Zod compartidos entre web y móvil
├── src/
│   ├── app/                 # Páginas de Next.js y Route Handlers (/api)
│   ├── components/          # Componentes de UI y utilidades de renderizado
│   ├── db/                  # Esquemas y cliente de conexión Drizzle ORM
│   ├── domain/              # Lógica de dominio pura (dispositivos, outbox, auditoría)
│   ├── lib/                 # Storage (S3/local), logger redactado, validación Zod
│   └── server/              # Contexto de petición, autenticación y errores HTTP
├── .agents/                 # Definiciones de agentes Antigravity y skills
├── docs/                    # Documentación arquitectónica, ADRs y runbooks
├── scripts/                 # Scripts de backup a S3, verificación de entorno y tests
└── specs/                   # Especificaciones de features conforme a SDD
```

## 🛠️ Comandos de Desarrollo

```bash
# Iniciar servidor de desarrollo web
npm run dev

# Ejecutar suite de pruebas unitarias
npm run test:unit

# Verificar tipos TypeScript en web y contratos
npm run typecheck

# Verificar cliente móvil Expo
npm run check:mobile

# Linter de código
npm run lint

# Generar y aplicar migraciones de base de datos
npm run db:generate
npm run db:migrate
```

## 📋 Flujo de Trabajo con Agentes

Para implementar nuevas funcionalidades, siga el flujo **Spec-Driven Development**:
1. Cree la especificación de la feature en `specs/` con criterios de aceptación.
2. `product-manager-agent` valida los requisitos.
3. `change-planner-agent` descompone en tareas atómicas en `TASKS.md`.
4. `backend-agent`, `frontend-agent` o `mobile-agent` implementan respetando `@starter/contracts`.
5. `test-engineer-agent` y `qa-agent` verifican los criterios antes de dar por completada la tarea.
