# ADR-003: Better Auth para Autenticación Multi-Tenant Autónoma sin Vendor Lock-in

- **Estado:** ACEPTADO
- **Fecha:** 2026-09-21
- **Decisores:** `orchestrator-agent`, `backend-agent`, `security-agent`, `docs-agent`
- **Consultados:** `frontend-agent`, `mobile-agent`, `platform-release-agent`
- **Referencias:** [`STACK.md`](../../STACK.md), [`src/server/auth.ts`](../../src/server/auth.ts), [`docs/architecture/starter-architecture-guide.md`](../architecture/starter-architecture-guide.md), [`docs/operations/enterprise-runbook.md`](../operations/enterprise-runbook.md)

---

## 1. Contexto y Planteamiento del Problema

El sistema **GS Vera Clinic / CareFlow HomeCare** administra identidades de personal sanitario (enfermeras, coordinadores clínicos, supervisores y directores médicos) y requiere un modelo de autenticación y control de acceso robusto, conforme con las siguientes necesidades críticas:

1. **Soberanía y Privacidad de Datos (LFPDPPP):** La legislación mexicana de protección de datos personales sensibles en posesión de particulares exige que las credenciales, sesiones y metadatos de identidad residan bajo la infraestructura controlada de la organización proveedora de salud, evitando la dispersión de datos en servicios en la nube de terceros no certificados.
2. **Aislamiento Multi-Tenant Nativo:** Soporte para múltiples organizaciones y agencias de salud (`organization_id`), asociando a los usuarios a sus respectivas entidades con roles diferenciados (`admin_global`, `clinical_lead`, `registered_nurse`, `caregiver`, `coordinator`).
3. **Compatibilidad Dual Web y Móvil:** Capacidad de gestionar sesiones basadas en cookies seguras `HttpOnly` para la interfaz web Next.js, y tokens de sesión persistentes seguros para la aplicación móvil Expo / React Native en campo.
4. **Independencia de Proveedores Comerciales (Cero Vendor Lock-in):** Evitar esquemas tarifarios crecientes por usuario activo mensual (MAU) que comprometan la viabilidad financiera del modelo de negocio de atención domiciliaria.

---

## 2. Alternativas Consideradas

### 2.1 Opción A: Proveedores de Autenticación SaaS (Auth0, Okta, Clerk)

- **Descripción:** Delegar el flujo de autenticación, almacenamiento de contraseñas y emisión de tokens a un servicio externo completamente gestionado.
- **Razón de Descarte:**
  - **Costos prohibitivos y crecientes:** El modelo de cobro por MAU escala de forma exponencial al incorporar cuadrillas grandes de enfermería y personal de campo con turnos esporádicos.
  - **Vendor Lock-in:** Migrar usuarios y hashes de contraseñas fuera de estas plataformas suele ser complejo o intencionalmente restringido.
  - **Riesgo Regulatorio y Latencia:** Los datos de identidad residen en servidores fuera del control directo de la organización, introduciendo dependencias de disponibilidad externa y posibles conflictos con políticas de privacidad locales.

### 2.2 Opción B: Supabase Auth (GoTrue)

- **Descripción:** Uso del subsistema de autenticación de Supabase montado sobre PostgreSQL.
- **Razón de Descarte:**
  - Supone un acoplamiento directo al ecosistema y extensiones específicas de Supabase (`gotrue`, `pg_net`), lo cual complica su despliegue y mantenimiento autónomo en instancias estándar VPS con Docker Compose y NGINX existente.

### 2.3 Opción C: NextAuth.js / Auth.js (v5)

- **Descripción:** Biblioteca estándar histórica para autenticación en aplicaciones Next.js.
- **Razón de Descarte:**
  - Transición inestable y cambios incompatibles frecuentes entre versiones (v4 a v5 beta).
  - Complejidad arquitectónica para soportar escenarios multi-tenant nativos donde la organización forma parte de la clave compuesta de la sesión.
  - Soporte limitado y fricción considerable para la integración con clientes móviles independientes de React Native sin un navegador embebido.

### 2.4 Opción D: Desarrollo Propio de Autenticación (Custom JWT / Hand-rolled)

- **Descripción:** Implementación manual de endpoints de login, hashing de contraseñas con bcrypt/argon2 y emisión de JWTs.
- **Razón de Descarte:**
  - Riesgo elevado de vulnerabilidades criptográficas: ataques de timing, configuración inadecuada de tokens de refresco, debilidades ante CSRF y gestión errónea de sesiones concurrentes.
  - Desviación de recursos de desarrollo en reinventar mecanismos estándar de seguridad.

---

## 3. Decisión Adoptada

Se adopta **Better Auth (versión 1.7.5)** como la solución de autenticación y gestión de sesiones multi-tenant autónoma y estándar del proyecto.

### Componentes y Configuración de la Solución:

1. **Almacenamiento Local en PostgreSQL con Drizzle ORM:**
   - Las tablas de Better Auth (`users`, `sessions`, `accounts`, `verifications`, `organizations`) se gestionan mediante el mismo esquema tipado de Drizzle ORM en `src/db/schema.ts`, compartiendo la base de datos relacional del proyecto.
   - Las consultas de verificación de sesión se ejecutan localmente con latencia inferior a 2 ms, sin saltos de red externos.
2. **Resolución de Contexto Unificada (`src/server/auth.ts`):**
   - La función `getRequestContext(request)` valida de forma determinista la sesión y resuelve la tupla `(userId, organizationId, role)`.
   - Soporte para cabeceras de contexto (`x-organization-id`, `x-user-id`, `x-user-role`) validadas contra la sesión activa en el servidor.
3. **Seguridad y Criptografía:**
   - Hashing seguro de contraseñas de última generación (Argon2id/Scrypt nativo de Better Auth).
   - Firma criptográfica de sesiones controlada por el secreto maestro de entorno `BETTER_AUTH_SECRET` (mínimo 32 bytes en formato hexadecimal).
   - Cookies con banderas de protección estrictas: `HttpOnly`, `SameSite=Lax` (o `Strict`), y `Secure` obligatoria en entornos HTTPS (staging y producción).
4. **Soporte Móvil:**
   - La aplicación móvil almacena los tokens de sesión en el llavero seguro nativo del hardware (`expo-secure-store`), transmitiéndolos mediante la cabecera `Authorization: Bearer <token>` a los Route Handlers de Next.js.

---

## 4. Pros y Contras

### Pros

- **Autonomía Total y Cero Costo por MAU:** No existen cargos recurrentes por volumen de usuarios o inicios de sesión.
- **Soberanía y Cumplimiento Regulatorio:** Los datos de credenciales y registros de acceso permanecen 100% dentro de la base de datos PostgreSQL de la empresa.
- **Extensibilidad Multi-Tenant:** Capacidad de extender el modelo de datos con atributos médicos (cédula profesional, certificaciones sanitarias, estatus de geocerca) directamente en el esquema relacional.
- **Integración Nativa con Next.js y Drizzle:** Código en TypeScript puro, validación con Zod y compatibilidad total con Server Components y Route Handlers.

### Contras y Mitigaciones

- **Responsabilidad Operativa de Secretos:** La seguridad recae en la protección y rotación del secreto `BETTER_AUTH_SECRET`.
  - _Mitigación:_ Se establece un procedimiento estandarizado en el Runbook SRE para generar y rotar el secreto criptográfico mediante `openssl rand -hex 32` sin interrumpir sesiones legítimas de forma abrupta.
- **Gestión de Migraciones de Autenticación:** Nuevas características de Better Auth pueden requerir migraciones de base de datos.
  - _Mitigación:_ Se integran en el pipeline de migraciones versionadas de Drizzle Kit (`npm run db:migrate`).

---

## 5. Validación y Conformidad

- **Pruebas de Validación de Entorno:** El validador `scripts/validate-staging-env.mjs` comprueba que `BETTER_AUTH_SECRET` tenga una longitud mínima de 64 caracteres hex y enmascara su contenido en pantalla.
- **Pruebas de Integración y Seguridad:** Las suites de integración (`tests/integration/`) y las auditorías de seguridad en `docs/security/work-orders-security-review.md` certifican el bloqueo con `401 UNAUTHORIZED` ante credenciales inválidas y `403 FORBIDDEN` ante accesos no autorizados.
