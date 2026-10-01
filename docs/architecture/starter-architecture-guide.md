# Manual Canónico de Arquitectura y Gobernanza del Starter

## Golden Starter V3 — v3.0.0

- **Versión del Documento:** 3.0.0
- **Fecha de Certificación:** 2026-09-30
- **Base SHA Integrada:** `main`
- **Estado:** CANÓNICO (Aprobado para Gobernanza y Operaciones)
- **Autor y Mantenedores:** `docs-agent` en coordinación con `orchestrator-agent`, `sre-agent` y `devops-agent`
- **Referencias Base:** [`golden-starter.manifest.json`](../../golden-starter.manifest.json), [`STACK.md`](../../STACK.md), [`ARCHITECTURE.md`](../../ARCHITECTURE.md), [`docs/adr/README.md`](../adr/README.md), [`docs/operations/enterprise-runbook.md`](../operations/enterprise-runbook.md)

---

## 1. Visión General del Monorepo

El **Golden Starter V3** es una plantilla monorepo TypeScript integral de grado empresarial diseñada con una **arquitectura desacoplada, multi-tenant y offline-first**. Proporciona una base técnica robusta, segura y lista para producción sobre la cual construir aplicaciones web y móviles para cualquier industria o dominio de negocio.

### 1.1 Estructura de Espacios de Trabajo (Workspaces)

El repositorio está estructurado mediante npm workspaces:

```
golden-starter-v3/
├── apps/
│   └── mobile/                 # Aplicación móvil Expo SDK 57 / React Native
├── packages/
│   └── contracts/              # Contratos y esquemas Zod puros compartidos (cero dependencias server)
├── src/                        # Núcleo Web Next.js 16 (App Router) y APIs
│   ├── app/                    # Rutas de interfaz web y Route Handlers (/api/**)
│   ├── components/             # Componentes de UI (DataGrid, ResponsiveShell, OutboxBanner)
│   ├── db/                     # Esquemas Drizzle ORM y conexión PostgreSQL
│   ├── domain/                 # Lógica de dominio del starter (sync, outbox, geofence, audit)
│   └── server/                 # Contexto de autenticación, control de acceso RBAC y errores
├── drizzle/                    # Migraciones relacionales PostgreSQL versionadas
├── docs/                       # Documentación técnica, ADRs canónicos y runbooks SRE
│   ├── adr/                    # Suite formal de Decisiones de Arquitectura (ADR-001 a ADR-005)
│   ├── architecture/           # Guías de arquitectura y gobernanza del starter
│   └── operations/             # Runbooks operativos SRE y staging
├── scripts/                    # Utilidades de verificación, simulación y extracción
└── .agents/                    # Catálogo local de 17 agentes Antigravity y habilidades SRE
```

### 1.2 Pila Tecnológica Canónica

Conforme a la fuente de verdad técnica estipulada en [`STACK.md`](../../STACK.md) y certificada en [`golden-starter.manifest.json`](../../golden-starter.manifest.json), los componentes y versiones exactas del runtime son:

| Componente             | Tecnología              | Versión Certificada         | Rol en el Sistema                                       |
| :--------------------- | :---------------------- | :-------------------------- | :------------------------------------------------------ |
| **Runtime Base**       | Node.js                 | `>=24 <25` (LTS)            | Motor de ejecución del servidor, scripts y pipelines    |
| **Gestor de Paquetes** | npm                     | `>=11 <12`                  | Resolución de dependencias y orquestación de workspaces |
| **Web Framework**      | Next.js                 | `16.3.5`                    | App Router, Server Components y Route Handlers          |
| **Web UI**             | React / React DOM       | `19.2.0`                    | Biblioteca de componentes web interactivos              |
| **Estilos Web**        | Tailwind CSS            | `4.1.0`                     | Motor de utilidades CSS integrado con PostCSS           |
| **Mobile Runtime**     | Expo SDK / React Native | `57.0.24` / `RN 0.86.3`     | Aplicación móvil nativa para Android e iOS              |
| **Mobile Router**      | Expo Router             | `57.0.22`                   | Navegación basada en sistema de archivos                |
| **Motor JS Móvil**     | Hermes Engine           | Integrado SDK 57            | Bytecode optimizado para arranque rápido en móviles     |
| **Base de Datos**      | PostgreSQL              | `18` (Dev) / `16` (Staging) | Motor relacional transaccional persistente ACID         |
| **ORM / Migraciones**  | Drizzle ORM / Kit       | `0.45.2` / `0.31.10`        | Modelado relacional tipado y generación de SQL          |
| **Autenticación**      | Better-Auth             | `1.7.5`                     | Autenticación multi-rol, control de sesiones y tokens   |
| **Contratos de Datos** | Zod                     | `4.6.5`                     | Esquemas de validación e inferencia de tipos estáticos  |
| **Pruebas de Lógica**  | Vitest                  | `2.1.9`                     | Suite de pruebas unitarias y de integración rápida      |
| **Pruebas Web E2E**    | Playwright              | `1.63.0`                    | Automatización de flujos de usuario extremo a extremo   |
| **Contenedores**       | Docker / Compose        | Docker Engine 26+ / v2      | Contenedorización multi-stage y orquestación local      |

---

### 1.3 Arquitectura de Componentes de Golden Starter V3

El repositorio establece una clara separación de responsabilidades entre sus capas modulares:

```mermaid
flowchart TD
    subgraph Clients["Clientes Multi-Plataforma"]
        Web["Aplicación Web Next.js 16<br/>(src/app, ResponsiveShell, DataGrid)"]
        Mobile["Aplicación Móvil Expo SDK 57<br/>(apps/mobile, OfflineOutbox, Geofence)"]
    end

    subgraph Contracts["Contratos Puros Compartidos (packages/contracts)"]
        ZodSchemas["Esquemas Zod de Validación<br/>(Auth, Sync, Organizations, Users, Devices)"]
    end

    subgraph Core["Núcleo del Servidor (src/)"]
        Auth["Better-Auth + RBAC Multi-Tenant<br/>(src/server/auth.ts)"]
        DB["PostgreSQL 18 + Drizzle ORM<br/>(src/db/)"]
        S3["Almacenamiento Privado S3<br/>(URLs firmadas efímeras)"]
        Outbox["Outbox Pattern & Idempotencia<br/>(src/domain/sync.ts)"]
        Audit["Pista de Auditoría Append-Only<br/>(audit_entries)"]
        SRE["Orquestación Docker Compose & NGINX<br/>(docs/operations/enterprise-runbook.md)"]
    end

    Web -->|Consume contratos| ZodSchemas
    Mobile -->|Consume contratos| ZodSchemas
    Web -->|Route Handlers| Core
    Mobile -->|API REST / Sincronización| Core
```

#### Responsabilidades Principales:

1. **Núcleo Genérico Empresarial (_Generic Enterprise Core_):**
   - **Autenticación y Sesiones:** Gestión autónoma con Better-Auth, sesiones con cookies `HttpOnly`, soporte para clientes móviles y control de roles RBAC (`admin_global`, `org_admin`, `manager`, `member`, `viewer`).
   - **Aislamiento Multi-Tenant:** Filtrado estricto por `organization_id` en todas las consultas y aserción de tenant en Route Handlers (`assertOrganizationAccess`).
   - **Almacenamiento Protegido S3:** Subida y descarga de archivos privados mediante URLs temporales prefirmadas (ADR-004), sin almacenamiento en disco de contenedor ni buckets públicos.
   - **Sincronización Offline e Idempotencia:** Deduplicación por `clientEventId`, soporte de reintentos seguros sin corrupción de estado y cola outbox local.
   - **Auditoría Inmutable:** Registro append-only en `audit_entries` con metadatos JSONB para trazabilidad legal y forense.
   - **Infraestructura y Confiabilidad:** Orquestación con Docker Compose v2 (ADR-005) adaptada a VPS existente con NGINX en el host, comprobación de salud en `/api/health` y manuales SRE.
   - **Gestión de Dispositivos:** Registro, cuarentena y revocación remota de dispositivos móviles extraviados o desautorizados.

---

### 1.4 Gobernanza de Diseño: Regla Mandatoria de Aprobación de Interfaces

Para erradicar discrepancias entre el diseño visual acordado y la implementación en código, rige la siguiente directriz institucional inquebrantable:

> [!CAUTION] > **REGLA OBLIGATORIA DE GOBERNANZA DE DISEÑO (GATE VISUAL)** > **Los equipos de Frontend (`frontend-agent`) y Mobile (`mobile-agent`) tienen ESTRICTAMENTE PROHIBIDO implementar interfaces de usuario (web o móvil) sin una especificación visual con estado explícito `APPROVED_BY_USER` emitido formalmente por el usuario.** > **EL SILENCIO NUNCA ES APROBACIÓN.**

#### Flujo Operativo del Gate de Diseño:

```mermaid
sequenceDiagram
    autonumber
    actor Usuario as Usuario / Stakeholder
    participant Design as ui-ux-designer-agent (Stitch)
    participant Spec as Especificación Visual (specs/)
    participant Dev as frontend-agent / mobile-agent
    participant QA as qa-agent (Tribunal de Cierre)

    Design->>Usuario: Presenta propuesta interactiva / Tokens de diseño
    alt Usuario Emite Comentarios / Rechazo
        Usuario-->>Design: Solicita ajustes de accesibilidad / flujo
        Design->>Design: Itera especificación (Estado: DRAFT / IN_REVIEW)
        Note over Dev: PROHIBIDO tocar código UI
    else Usuario Aprueba Formalmente
        Usuario-->>Design: Emite aprobación explícita
        Design->>Spec: Registra estado: APPROVED_BY_USER con fecha y digest
        Spec-->>Dev: Autoriza inicio de implementación UI
        Dev->>Dev: Desarrolla componentes web y pantallas móviles
        Dev->>QA: Envía entrega con entregables UI
        QA->>Spec: Valida presencia irrefutable de APPROVED_BY_USER
        QA-->>Dev: Dictamen Aprobado (Gate C-003 superado)
    end
```

1. **Prohibición de Supuestos:** Si el usuario no responde a una propuesta de diseño, la tarea permanece en espera. Ningún agente puede inferir aprobación tácita o avanzar bajo asunciones técnicas.
2. **Rechazo Automático en QA:** Cualquier Pull Request o artefacto de entrega que introduzca cambios visuales sin vincular a un documento en `specs/` con estado `APPROVED_BY_USER` será inmediatamente rechazado por `qa-agent` bajo el criterio C-003.

---

## 2. Patrones Clave de Arquitectura

El diseño de **Golden Starter V3** implementa cinco patrones fundamentales que garantizan aislamiento, seguridad, integridad de datos y experiencia continua sin red.

### 2.1 Aislamiento Multi-Tenant Estricto (`organizationId`)

El sistema es multi-empresa (_multi-tenant_) por diseño. Ninguna organización puede visualizar, mutar ni sincronizar registros, usuarios o dispositivos que pertenezcan a otra entidad.

```mermaid
flowchart TD
    Req[Cliente Web / Móvil] -->|HTTP Headers: x-organization-id, x-user-id, x-user-role| Route[Route Handler: /api/**]
    Route --> Ctx[getRequestContext]
    Ctx --> ResOrg[Recurso Objetivo: resourceOrgId]
    ResOrg --> AuthCheck{context.role === admin_global?}
    AuthCheck -- Sí --> Allow[Acceso Concedido: Auditoría Cross-Tenant]
    AuthCheck -- No --> OrgMatch{context.organizationId === resourceOrgId?}
    OrgMatch -- Sí --> Allow
    OrgMatch -- No --> Deny[403 CROSS_ORG_ACCESS_DENIED]
```

#### Reglas de Aislamiento en Datos y Código:

1. **Clave Foránea Obligatoria:** Todas las tablas de datos de negocio en `src/db/schema.ts` (`users`, `devices`, `syncEvents`, `auditLogs`, `errorLogs`) definen `organizationId: uuid("organization_id").notNull().references(() => organizations.id)`.
2. **Resolución de Contexto (`src/server/auth.ts`):** La función `getRequestContext(request)` extrae la identidad del llamador aplicando el orden de precedencia:
   - Cabecera HTTP `x-organization-id`
   - Parámetro de consulta `?organizationId=`
   - Fallback configurado por la aplicación (`org-demo-001` en modo desarrollo)
3. **Control por Objeto (`assertOrganizationAccess`):** Antes de retornar o persistir un recurso, el Route Handler evalúa:
   ```typescript
   export function assertOrganizationAccess(context: RequestContext, resourceOrgId: string): void {
     if (context.role === "admin_global") return; // Supervisión cross-tenant controlada
     if (context.organizationId !== resourceOrgId) {
       throw new ApiHttpError(403, "CROSS_ORG_ACCESS_DENIED", `Access denied...`);
     }
   }
   ```
4. **Validación de Lotes de Sincronización:** En `POST /api/sync`, si el payload de un evento contiene un identificador de organización explícito o un dispositivo registrado, se valida su correspondencia contra el tenant del llamador.

---

### 2.2 Separación Estricta de Contratos Zod Puros (`packages/contracts`)

Para evitar acoplamientos indeseados entre el backend web y el cliente móvil, todos los esquemas de datos serializables residen exclusivamente en el espacio de trabajo `packages/contracts`.

#### Invariantes del Paquete de Contratos:

- **Cero Dependencias de Plataforma:** El paquete sólo depende de `zod`. Está estrictamente prohibido importar módulos de servidor (`fs`, `path`, `crypto`, Drizzle ORM, Better-Auth) o módulos nativos de React/Expo.
- **Tipado Unidireccional e Inferido:** Los tipos TypeScript de dominio (`User`, `Organization`, `Device`, `SyncEvent`, `AuditLog`, etc.) se generan automáticamente a través de `z.infer<typeof schema>`.
- **Estandarización de Respuestas de Error:** Todas las fallas HTTP implementan el contrato `apiErrorResponseSchema`:
  ```typescript
  {
    code: string,
    message: string,
    details?: unknown,
    requestId: string
  }
  ```
- **Refinamiento de Validación Cruzada (`superRefine`):** Las reglas complejas (tales como validaciones condicionales o justificaciones obligatorias) se validan directamente en el contrato de entrada.

---

### 2.3 Gobernanza de Datos, Privacidad y Retención de Registros

El manejo de información empresarial y datos sensibles está protegido por directrices estrictas de retención, privacidad y trazabilidad inmutable.

```mermaid
stateDiagram-v2
    [*] --> Activo: Creación de Registro
    Activo --> Archivado: Inactivación Lógica
    note right of Archivado
      Status: archived
      Prohibición de DELETE físico.
      Motivo y usuario obligatorios.
      Preservación íntegra histórica.
    end note
    Archivado --> RetencionProtegida: Período de Retención Legal
    note right of RetencionProtegida
      isProtectedByLaw: true
      meetsRetention: false
      Retención corporativa obligatoria.
      Inviolabilidad de registros históricos.
    end note
    RetencionProtegida --> RetencionCumplida: Vencimiento de Retención
    note right of RetencionCumplida
      meetsRetention: true
      isProtectedByLaw: false
      Posible dictamen de baja documental.
    end note
```

#### Directrices Normativas Implementadas:

1. **Cero Borrado Físico Accidental (No DELETE en entidades clave):**
   - Las tablas críticas carecen de operaciones `DELETE` destructivas en Route Handlers estándar.
   - Las solicitudes de baja o retiro conducen a un archivado lógico con congelamiento de estado.
2. **Archivado Lógico con Trazabilidad:**
   - Exige identificador de usuario (`archivedBy`), marca temporal UTC (`archivedAt`) y motivo justificado (`archiveReason`).
   - Persiste estos metadatos y crea una entrada inmutable en `audit_entries`.
3. **Retención Legal y Regulatoria:**
   - Reglas de retención configurables que evalúan la antigüedad exacta del expediente o registro antes de permitir su purga.
4. **Restricción Estricta de Exportación de Datos (RBAC):**
   - La exportación masiva de datos sensibles está restringida exclusivamente a roles autorizados (`admin_global`, `org_admin`).
   - Cualquier intento de exportación por parte de roles sin privilegios es rechazado con `403 FORBIDDEN`.
5. **Privacidad y Minimización de Datos:**
   - Prohibición de persistir registros de usuarios reales durante fases de prueba o staging; todos los fixtures son sintéticos.
   - Minimización de datos en telemetría: la bitácora `audit_entries` registra únicamente eventos de control sin duplicar payloads sensibles.

---

### 2.4 Reglas de Negocio Reactivas: Validación y Bloqueo con Justificación

En flujos donde se ingresan valores que exceden los rangos operacionales esperados o representan anomalías, el sistema aplica un patrón de validación con bloqueo y justificación.

```mermaid
flowchart TD
    Input[Operador captura Registro / Métrica] --> Eval{Valor dentro de Umbrales?}
    Eval -- Sí (Normal) --> AllowSave[Habilitar Guardado Directo]
    Eval -- No (Fuera de Umbral) --> ModeCheck{Modo de Control}
    ModeCheck -- advertencia_informativa --> Warn[Mostrar Banner Informativo] --> AllowSave
    ModeCheck -- bloqueo_con_justificacion --> Block[Bloquear Botón Guardar]
    Block --> JustReq[Exigir Justificación Obligatoria]
    JustReq --> InputJust{¿Justificación ingresada?}
    InputJust -- No / Vacía --> KeepBlocked[Mantener Guardado Deshabilitado]
    InputJust -- Sí (Texto Justificado) --> AllowSaveWithJust[Guardar con Justificación y Auditoría]
```

#### Especificación del Patrón:

- **Dominio:** La función de evaluación retorna `{ isOutOfRange, requiresJustification, shouldEscalate }`.
- **Contrato de Servidor:** La validación Zod `superRefine` rechaza peticiones HTTP con error 400 si el valor se encuentra fuera de umbral y no se acompaña de una justificación explicativa válida.
- **Componentes de UI:** La interfaz bloquea reactivamente la acción del usuario mostrando un campo de justificación con resaltado de advertencia y deshabilitando el botón de confirmación hasta registrar la razón operativa.

---

### 2.5 Arquitectura Offline-First: Outbox Local, Idempotencia y Geocercas

El entorno de trabajo en campo frecuentemente presenta interrupciones o nula cobertura de conectividad. La arquitectura está diseñada para operar con total normalidad sin red.

```mermaid
sequenceDiagram
    autonumber
    actor User as Operador de Campo (Móvil)
    participant Client as App Expo (SQLite Outbox)
    participant Server as Next.js (/api/sync)
    participant DB as PostgreSQL (sync_events)

    Note over User,Client: Sin Conexión a Internet (Offline)
    User->>Client: Registra Actividad / Evento
    Client->>Client: Genera clientEventId (UUIDv4/Timestamp)
    Client->>Client: Almacena en Outbox Local (Persistente)
    Client-->>User: Confirmación Inmediata en UI

    Note over Client,Server: Recuperación de Conectividad (Online)
    Client->>Server: POST /api/sync { events: [OutboxRecords] }
    Server->>DB: Busca client_event_id en sync_events
    alt Evento Nuevo
        Server->>DB: Inserta sync_event y procesa payload
        Server->>DB: Registra SYNC_EVENT_ACCEPTED en auditoría
        Server-->>Client: 200 OK { status: accepted }
    else Evento Duplicado (Reintento de red)
        Server-->>Client: 200 OK { status: duplicate, record: existente }
    end
    Client->>Client: Purga registros sincronizados de Outbox
```

#### Mecanismos de Resiliencia:

1. **Outbox Local Desacoplado:** Toda interacción móvil genera un registro con `clientEventId`, tipo de evento, marca temporal `occurredAt` y payload asociado en SQLite local.
2. **Deduplicación e Idempotencia:**
   - La tabla de base de datos `sync_events` define un índice único sobre `client_event_id`.
   - La función `acceptIdempotentEvent` (`src/domain/sync.ts`) detecta transmisiones repetidas originadas por fallos en la confirmación TCP/HTTP y retorna la referencia previa sin crear registros espurios ni duplicar asientos de auditoría.
3. **Geocerca Operativa con Excepciones Estructuradas:**
   - Implementada mediante cálculo trigonométrico de Haversine (`src/domain/geofence.ts`).
   - El radio de atención estándar es configurable respecto a las coordenadas objetivo (`geofenceRadiusMeters: 50`).
   - Se evalúa la precisión del sensor del dispositivo (`accuracyMeters <= 50m`). Si el dispositivo se sitúa fuera del radio permitido, se requiere registrar una justificación o excepción tipificada para continuar.

---

### 2.6 Catálogo y Coreografía de los 17 Agentes Locales Antigravity

El desarrollo, mantenimiento y gobernanza del proyecto está orquestado por un ecosistema de **17 agentes inteligentes locales** de Google Antigravity, configurados de manera no intrusiva en `.agents/agents/` sin requerir instalación global ni modificar `~/.gemini/config/agents`.

```mermaid
flowchart TD
    subgraph Principales["Agentes Principales (Main)"]
        Orch[orchestrator-agent<br/>Coordinación, Delegación, Gates]
        PM[product-manager-agent<br/>Q&A Interactivo, PRD, Reglas]
        Design[ui-ux-designer-agent<br/>Diseño Stitch, UI Specs]
    end

    subgraph Especialistas["Especialistas de Implementación y Análisis"]
        Repo[repo-explorer-agent<br/>Mapeo de Repo]
        Plan[change-planner-agent<br/>Planes de Impacto]
        Back[backend-agent<br/>API, Dominio, Contratos]
        Front[frontend-agent<br/>Next.js 16 Web]
        Mob[mobile-agent<br/>Expo 57 React Native]
        Infra[infra-data-agent<br/>Drizzle, Postgres, Docker]
    end

    subgraph InfraOperaciones["Infraestructura, SRE y Despliegues"]
        DevOps[devops-agent<br/>Docker, NGINX Host, CI/CD]
        SRE[sre-agent<br/>Confiabilidad, Resiliencia, Runbook]
    end

    subgraph CalidadSeguridad["Aseguramiento, Seguridad y Release"]
        Test[test-engineer-agent<br/>Vitest, Playwright, Simulación]
        Debug[debugger-regression-agent<br/>Repro, Fallas, Regresión]
        Sec[security-agent<br/>Auditoría Seguridad, RBAC]
        Docs[docs-agent<br/>Docs Canónicos, Runbooks, ADRs]
        Rel[platform-release-agent<br/>CI/CD, EAS, Starter Extract]
        QA[qa-agent<br/>Gate de Cierre Independiente]
    end

    PM -->|Requisitos y Aceptación| Orch
    Design -->|Handoff de Pantallas| Orch
    Orch -->|Delega Tareas| Especialistas
    Orch -->|Coordina Infraestructura| InfraOperaciones
    Especialistas -->|Código e Implementación| Test
    InfraOperaciones -->|Ambientes y Confiabilidad| SRE
    Test -->|Evidencias de Pruebas| Sec
    Sec -->|Veredicto de Seguridad| Rel
    Rel -->|Empaquetado y Pipelines| Docs
    Docs -->|Manuales y Runbooks| QA
    QA -->|Veredicto Final de Release| Orch
```

#### Catálogo Oficial de Agentes:

|   #    | Nombre del Agente           | Rol Operativo                                                                           | Política de Shell      | Herramientas Asignadas                                                               | Habilidades (Skills)           |
| :----: | :-------------------------- | :-------------------------------------------------------------------------------------- | :--------------------- | :----------------------------------------------------------------------------------- | :----------------------------- |
| **1**  | `orchestrator-agent`        | Coordinación general del flujo, DAG de tareas, integración y aplicación de gates.       | `sandbox`              | `view_file`, `grep_search`, `replace_file_content`, `run_command`, `invoke_subagent` | —                              |
| **2**  | `product-manager-agent`     | Conduce sesiones live de producto, traduce decisiones a PRD sin supuestos no autorizados.| `off` (Solo docs)      | `view_file`, `grep_search`, `replace_file_content`                                   | `skills/live-product-qa`       |
| **3**  | `ui-ux-designer-agent`      | Diseña interfaces web y mobile con tokens de diseño; gestiona aprobaciones con Stitch.  | `off` (Solo specs)     | `view_file`, `grep_search`, `replace_file_content`                                   | `skills/live-design-review`    |
| **4**  | `repo-explorer-agent`       | Explora y mapea estructura de archivos, módulos y dependencias de forma pasiva.         | `off` (Lectura)        | `view_file`, `grep_search`                                                           | —                              |
| **5**  | `change-planner-agent`      | Genera planes de cambio atómicos, secuenciales y con estimación de impacto.             | `off` (Solo artifacts) | `view_file`, `grep_search`, `replace_file_content`                                   | —                              |
| **6**  | `frontend-agent`            | Desarrolla la aplicación web Next.js 16 con App Router, React 19 y Tailwind CSS 4.      | `sandbox`              | `view_file`, `grep_search`, `replace_file_content`, `run_command`                    | —                              |
| **7**  | `mobile-agent`              | Desarrolla la app nativa Expo 57 / React Native, navegación y sincronización offline.   | `sandbox`              | `view_file`, `grep_search`, `replace_file_content`, `run_command`                    | —                              |
| **8**  | `backend-agent`             | Implementa contratos Zod, Route Handlers, servicios de dominio y control RBAC.          | `sandbox`              | `view_file`, `grep_search`, `replace_file_content`, `run_command`                    | —                              |
| **9**  | `infra-data-agent`          | Gestiona esquemas Drizzle, PostgreSQL, migraciones, Dockerfile y docker-compose.        | `sandbox`              | `view_file`, `grep_search`, `replace_file_content`, `run_command`                    | —                              |
| **10** | `test-engineer-agent`       | Construye y ejecuta suites Vitest, Playwright y arneses de red simulada.                | `sandbox`              | `view_file`, `grep_search`, `replace_file_content`, `run_command`                    | —                              |
| **11** | `debugger-regression-agent` | Reproduce bugs, aísla causa raíz y escribe pruebas de regresión automatizadas.          | `sandbox`              | `view_file`, `grep_search`, `replace_file_content`, `run_command`                    | —                              |
| **12** | `security-agent`            | Audita cumplimiento de privacidad, control de secretos, RBAC, CI y hardening.          | `sandbox`              | `view_file`, `grep_search`, `replace_file_content`, `run_command`                    | —                              |
| **13** | `docs-agent`                | Produce documentación canónica, runbooks de operación y guías de arquitectura.          | `sandbox`              | `view_file`, `grep_search`, `replace_file_content`, `run_command`                    | —                              |
| **14** | `platform-release-agent`    | Administra dependencias compartidas, pipelines de CI/CD, EAS y empaquetado del starter. | `sandbox`              | `view_file`, `grep_search`, `replace_file_content`, `run_command`                    | —                              |
| **15** | `qa-agent`                  | Actúa como tribunal de cierre independiente, auditando evidencia sin modificar código.  | `off` (Solo lectura)   | `view_file`, `grep_search`                                                           | —                              |
| **16** | `devops-agent`              | Diseña empaquetado Docker, Compose, proxy inverso NGINX host y pipelines CI/CD.         | `sandbox`              | `view_file`, `grep_search`, `replace_file_content`, `run_command`                    | `skills/production-deployment` |
| **17** | `sre-agent`                 | Responsable de confiabilidad, monitoreo de salud, mitigación de saturación y runbooks.  | `sandbox`              | `view_file`, `grep_search`, `replace_file_content`, `run_command`                    | —                              |

#### Protocolo de Comunicación y Handoff (Envelope v1):

Cada agente reporta su entrega mediante la estructura definida en [`docs/contrato-resultados.md`](../contrato-resultados.md):

- `schema_version`: "1.0"
- `task_id` / `run_id` / `agent_id`
- `evaluated_ref`: SHA del commit base evaluado
- `status`: `COMPLETED` | `FAILED` | `BLOCKED`
- `verdict`: `APPROVED` | `APPROVED_WITH_RESERVATIONS` | `REJECTED` | `NOT_APPLICABLE`
- `files_changed` y `deliverables`
- `checks`: Matriz de comandos ejecutados con exit_code, evidencia y estado
- `blockers` y `next_action`

---

## 3. Suite Formal de Decisiones de Arquitectura (ADRs) y Runbooks

Las directrices técnicas fundamentales del sistema están formalizadas en registros inmutables de decisión arquitectónica ([`docs/adr/README.md`](../adr/README.md)) y manuales de resiliencia operativa:

1. **[`ADR-001: Adopción Directa de Next.js`](../adr/ADR-001-direct-nextjs.md):** Justificación de App Router, React Server Components (RSC) y Route Handlers sin capas intermedias.
2. **[`ADR-002: PostgreSQL 18 como Motor Relacional Primario`](../adr/ADR-002-postgresql-18.md):** Transaccionalidad ACID estricta, JSONB nativo y extensiones enterprise.
3. **[`ADR-003: Better Auth para Autenticación Multi-Tenant`](../adr/ADR-003-better-auth.md):** Autenticación autónoma autohospedada sin costos recurrentes ni vendor lock-in.
4. **[`ADR-004: Almacenamiento Privado S3 con URLs Firmadas`](../adr/ADR-004-private-s3-storage.md):** Aislamiento de documentos privados y sensibles con URLs efímeras protegidas por RBAC.
5. **[`ADR-005: Orquestación con Docker Compose en Servidores Existentes`](../adr/ADR-005-docker-compose-orchestration.md):** Despliegue determinista y desacoplado coordinado con NGINX en el host.
6. **[`Runbook Operativo SRE`](../operations/enterprise-runbook.md):** Manual completo de contingencias (_too many clients_, saturación de disco, página de mantenimiento HTTP 503 en NGINX y rollback).
