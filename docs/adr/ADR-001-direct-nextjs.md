# ADR-001: Adopción Directa de Next.js (App Router, RSC, Route Handlers, TypeScript)

- **Estado:** ACEPTADO
- **Fecha:** 2026-09-21
- **Decisores:** `orchestrator-agent`, `platform-release-agent`, `backend-agent`, `frontend-agent`, `docs-agent`
- **Consultados:** `sre-agent`, `security-agent`
- **Referencias:** [`STACK.md`](../../STACK.md), [`golden-starter.manifest.json`](../../golden-starter.manifest.json), [`docs/architecture/starter-architecture-guide.md`](../architecture/starter-architecture-guide.md)

---

## 1. Contexto y Planteamiento del Problema

El desarrollo de **Golden Starter V3** exige una plataforma web corporativa de alto rendimiento, modular y resiliente para la administración multi-tenant, coordinación operativa y soporte offline-first. Los requisitos fundamentales del sistema incluyen:

1. **Aislamiento y Seguridad de Datos:** Garantizar que los secretos del servidor, la lógica de negocio sensible y las consultas a la base de datos PostgreSQL nunca se filtren al paquete JavaScript del cliente.
2. **Arquitectura Unificada de APIs y Renderizado:** Disponibilidad de endpoints HTTP RESTful estandarizados (`/api/**`) que atiendan tanto a la aplicación web como a la aplicación móvil Expo / React Native en campo, compartiendo validación estricta basada en Zod.
3. **Rendimiento y Carga Rápida:** Reducción drástica del bundle enviado a navegadores de escritorio y dispositivos móviles en campo, soportando renderizado en servidor (SSR) y streaming reactivo.
4. **Determinismo y Facilidad Operativa:** Soporte nativo de empaquetado autónomo (`output: 'standalone'`) para despliegue liviano mediante Docker en servidores Linux existentes.

---

## 2. Alternativas Consideradas

### 2.1 Opción A: Separación SPA con Vite + React + Servidor Express / Fastify Separado

- **Descripción:** Mantener dos proyectos independientes: una Single Page Application (SPA) cliente compilada con Vite y un servicio backend desacoplado en Express o Fastify.
- **Razón de Descarte:**
  - Introduce fricción operativa significativa: requiere gestionar dos pipelines de CI/CD, dos configuraciones de Docker y orquestación separada.
  - Ausencia de React Server Components (RSC): la SPA se ve obligada a descargar bibliotecas pesadas al navegador del usuario, exponiendo la superficie de ataque y aumentando el tiempo hasta la primera interacción (TTI).
  - Duplicación de interfaces y necesidad de capas adicionales de transporte o tRPC/OpenAPI sincronizadas manualmente.

### 2.2 Opción B: Remix / React Router v7

- **Descripción:** Uso del framework Remix con su modelo centrado en Web Standards, loaders y actions.
- **Razón de Descarte:**
  - Aunque presenta un modelo conceptual robusto, su ecosistema de integraciones empresariales (especialmente utilidades de empaquetado standalone para contenedores Docker con usuarios no-root) es más reducido comparado con Next.js.
  - Menor familiaridad del ecosistema y compatibilidad más limitada con herramientas corporativas de telemetría y hosting existentes en la organización.

### 2.3 Opción C: Next.js Pages Router (Arquitectura Legada)

- **Descripción:** Uso del enrutador clásico de Next.js (`pages/`, `getServerSideProps`, `pages/api`).
- **Razón de Descarte:**
  - Carece de soporte para React Server Components (RSC) y layouts anidados eficientes.
  - El modelo de `getServerSideProps` bloquea el renderizado de la página completa hasta que la promesa más lenta se resuelva, impidiendo el streaming granular mediante React Suspense.

### 2.4 Opción D: Frameworks Derivados o Wrappers No Canónicos (ej. Vinext)

- **Descripción:** Utilización de capas intermedias o emuladores no oficiales de Next.js.
- **Razón de Descarte:**
  - Descartado expresamente en [`STACK.md`](../../STACK.md): _"Next.js directo, sin Vinext"_. Introduce dependencias fantasma, desalineación con la documentación oficial de Vercel/React y retrasos en parches de seguridad críticos.

---

## 3. Decisión Adoptada

Se adopta **Next.js directo (versión certificada 16.3.5) con App Router (`src/app`), React Server Components (RSC), Route Handlers estándar de la Web API y TypeScript estricto** como la base integral de la aplicación web y la capa API del backend.

### Pilares de la Implementación:

1. **Frontera Explícita Servidor-Cliente:**
   - Todo componente por defecto es un **Server Component**, ejecutándose exclusivamente en Node.js.
   - Las páginas y componentes de servidor leen directamente del contexto de base de datos o servicios de dominio sin exponer endpoints internos innecesarios.
   - La directiva `'use client'` se reserva rigurosamente para componentes interactivos con estado local (`useState`, `useEffect`) o eventos del DOM (formularios interactivos, modales).
2. **Route Handlers Estándar (`src/app/api/**/route.ts`):\*\*
   - Utilizan los objetos estándar `Request` y `Response` de la Web API.
   - Aplican esquemas Zod procedentes de `packages/contracts` para validación de payloads y cabeceras de contexto (`x-organization-id`, `x-user-id`, `x-user-role`).
   - Sirven de forma unificada tanto a los componentes cliente de la web como a la aplicación móvil Expo.
3. **Compilación Standalone para Producción:**
   - La directiva `output: 'standalone'` en `next.config.ts` genera un servidor HTTP mínimo en `.next/standalone/server.js`, empaquetable en imágenes Docker de apenas ~150 MB sin requerir `node_modules` completos en runtime.

---

## 4. Pros y Contras

### Pros

- **Seguridad por Diseño:** Los componentes RSC nunca transmiten código fuente confidencial ni secretos de base de datos (`DATABASE_URL`, `BETTER_AUTH_SECRET`) al navegador del cliente.
- **Rendimiento Óptimo:** Menor peso de JavaScript descargado en dispositivos cliente, mejorando Core Web Vitals (LCP, INP).
- **Tipado Unificado:** Integración nativa con TypeScript 5.7+ sin necesidad de generar clientes HTTP redundantes.
- **Ecosistema y Mantenibilidad:** Acceso inmediato a la documentación canónica de Next.js y React 19, compatibilidad con herramientas de calidad (ESLint, Prettier, Playwright).

### Contras y Mitigaciones

- **Curva de Aprendizaje de Fronteras:** Desarrolladores noveles pueden accidentalmente importar módulos exclusivos de servidor en componentes cliente.
  - _Mitigación:_ Se implementan límites estrictos documentados en la arquitectura; `packages/contracts` prohíbe dependencias de servidor y el linter/typecheck falla de inmediato ante importaciones cruzadas ilícitas.
- **Incompatibilidad de Ciertas Librerías con RSC:** Algunas librerías legadas asumen ejecución en navegador.
  - _Mitigación:_ Aislamiento de componentes de terceros mediante componentes puente marcados con `'use client'`.

---

## 5. Validación y Conformidad

- **Verificación de Tipos:** `npm run typecheck` valida la ausencia de errores estáticos.
- **Compilación Web:** `npm run build:web` compila limpiamente bajo Next.js 16 con empaquetado standalone.
- **Pruebas Automatizadas:** Suites Vitest (`npm run test:unit`) y Playwright (`npm run test:e2e:web`) verifican el correcto funcionamiento de páginas y Route Handlers.
