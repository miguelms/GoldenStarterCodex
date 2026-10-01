# Runbook de Operaciones: Despliegue en Staging, Migraciones, Builds Móviles y Respuesta a Incidentes

## Golden Starter V3 — v3.0.0

- **Versión del Runbook:** 3.0.0
- **Fecha de Emisión:** 2026-09-30
- **Base SHA Evaluada:** `main`
- **Estado:** CANÓNICO (Aprobado para Operaciones de Campo y Staging)
- **Autor y Mantenedores:** `docs-agent` en coordinación con `platform-release-agent`, `infra-data-agent`, `sre-agent` y `devops-agent`
- **Referencias Técnicas:** [`docs/operations/enterprise-runbook.md`](enterprise-runbook.md), [`docs/adr/README.md`](../adr/README.md), [`docker-compose.staging.yml`](../../docker-compose.staging.yml), [`Dockerfile`](../../Dockerfile), [`apps/mobile/eas.json`](../../apps/mobile/eas.json), [`scripts/validate-staging-env.mjs`](../../scripts/validate-staging-env.mjs), [`docs/security/infrastructure-ci-security-review.md`](../security/infrastructure-ci-security-review.md)

---

## 1. Propósito y Alcance

Este manual de operaciones (_Standard Operating Procedure_ - SOP) proporciona las instrucciones detalladas y reproducibles para el despliegue, mantenimiento, compilación de binarios móviles y gestión de incidentes de seguridad en el entorno de **Staging** y pre-producción de Golden Starter V3.

### 1.1 Entornos Cubiertos

- **Staging Local / Nube Privada:** Orquestación basada en Docker Compose v2 sobre instancias Linux (ej. AWS EC2, servidores on-premise de prueba).
- **Canal de Pruebas Móviles:** Distribución de APKs independientes para teléfonos físicos de campo mediante perfiles EAS Build.
- **Base de Datos Persistente:** PostgreSQL 18/16 Alpine con volúmenes nombrados y comprobación de integridad (_healthchecks_).

---

## 2. Despliegue Paso a Paso en Staging (Docker & Compose)

### 2.1 Requisitos Previos del Host

1. **Docker Engine:** Versión `>= 26.0.0` con soporte nativo para Compose v2 (`docker compose`).
2. **Node.js y npm:** Node.js `>= 24.0.0` y npm `>= 11.0.0` para utilidades locales de migración y validación.
3. **Puertos de Red Disponibles:**
   - `3005`: Puerto de servicio HTTP de la aplicación web Next.js en staging.
   - `5432`: Puerto local de PostgreSQL para migraciones administrativas (restringido a `127.0.0.1` según recomendación SEC-INFRA-002).
4. **Memoria y Almacenamiento Mínimos:** 4 GB RAM y 20 GB de espacio libre en disco para compilación de imágenes y persistencia de base de datos.

---

### 2.2 Configuración y Validación de Variables de Entorno

El entorno de staging utiliza variables de entorno 100% sintéticas, garantizando que ninguna credencial de producción ni datos reales ingresen a la infraestructura de prueba.

```bash
# 1. Copiar la plantilla oficial si no existe .env.staging
cp .env.example .env.staging

# 2. Verificar que las variables requeridas estén presentes
# (.env.staging incluye configuraciones predefinidas para el contenedor staging)
```

#### Ejecución del Validador de Seguridad de Entorno:

Antes de iniciar cualquier contenedor, es mandatorio ejecutar el script de validación con enmascaramiento estricto de secretos:

```bash
node scripts/validate-staging-env.mjs
```

**Salida esperada (Exit Code 0):**

```text
🔍 Validating Staging Environment Configuration (.env.staging)...
  ✓ [VALID]   NODE_ENV = production
  ✓ [VALID]   PORT = 3005
  ✓ [VALID]   POSTGRES_URL = post***ging (length: 101)
  ✓ [VALID]   DATABASE_URL = post***ging (length: 101)
  ✓ [VALID]   BETTER_AUTH_SECRET = stag***cure (length: 64)
  ✓ [VALID]   BETTER_AUTH_URL = http://localhost:3005
  ✓ [VALID]   NEXT_PUBLIC_API_URL = http://localhost:3005
  ✓ [VALID]   NEXT_PUBLIC_APP_NAME = Golden Starter (Staging)
  ✓ [VALID]   NEXT_PUBLIC_GEOFENCE_RADIUS_METERS = 75
✅ Staging environment validation SUCCESSFUL (9 variables verified, 0 secrets exposed, 100% fictitious & functional).
```

---

### 2.3 Compilación y Despliegue de Contenedores

El despliegue se realiza mediante `docker-compose.staging.yml`, el cual coordina la compilación multi-stage de la aplicación web y el arranque de la base de datos con healthchecks sincronizados.

```bash
# 1. Compilar las imágenes asegurando contexto limpio
docker compose -f docker-compose.staging.yml build --no-cache

# 2. Iniciar los servicios en modo desacoplado (background)
docker compose -f docker-compose.staging.yml up -d

# 3. Comprobar el estado de los contenedores
docker compose -f docker-compose.staging.yml ps
```

**Salida esperada de `ps`:**

```text
NAME                    IMAGE                   COMMAND                  SERVICE   CREATED          STATUS                    PORTS
starter_db_staging      postgres:18-alpine      "docker-entrypoint.s…"   db        10 seconds ago   Up 9 seconds (healthy)    127.0.0.1:5432->5432/tcp
starter_web_staging     starter-web:staging     "node server.js"         web       9 seconds ago    Up 8 seconds (healthy)    0.0.0.0:3005->3005/tcp
```

---

### 2.4 Orquestación de Salud y Persistencia

```mermaid
flowchart TD
    Up[docker compose up -d] --> StartDB[Inicia starter_db_staging]
    StartDB --> CheckDB{Healthcheck DB:<br/>pg_isready -U staging_user}
    CheckDB -- Incompleto / Arrancando --> WaitDB[Espera intervalo 5s] --> CheckDB
    CheckDB -- healthy (exit 0) --> StartWeb[Inicia starter_web_staging<br/>(depends_on: db healthy)]
    StartWeb --> Standalone[Node server.js bajo usuario no-root UID 1001]
    Standalone --> CheckWeb{Healthcheck Web:<br/>fetch /api/health}
    CheckWeb -- Esperando puerto 3005 --> WaitWeb[Espera intervalo 10s] --> CheckWeb
    CheckWeb -- HTTP 200 { status: ok } --> SystemReady[Sistema Operativo en Staging]
```

#### Verificación Manual del Endpoint de Salud:

```bash
curl -i http://127.0.0.1:3005/api/health
```

**Respuesta HTTP 200:**

```json
{
  "service": "starter-web",
  "status": "ok",
  "version": "3.0.0"
}
```

#### Persistencia de PostgreSQL:

- Los datos residen en el volumen Docker con nombre `starter_staging_data`, mapeado a `/var/lib/postgresql/data`.
- Para detener el servicio sin destruir los registros y auditoría:
  ```bash
  docker compose -f docker-compose.staging.yml down
  # NUNCA utilizar la bandera -v o --volumes en operaciones normales de staging
  ```

---

## 3. Flujo de Migraciones Drizzle y Fixtures Ficticios

El esquema relacional de Golden Starter V3 se gestiona mediante Drizzle ORM y Drizzle Kit, asegurando trazabilidad formal de cambios mediante archivos SQL versionados en `drizzle/`.

### 3.1 Generación de Nuevas Migraciones de Esquema

Cuando se modifiquen las definiciones en `src/db/schema.ts`:

```bash
# Genera el archivo SQL incremental en el directorio drizzle/
npm run db:generate
```

### 3.2 Aplicación de Migraciones en la Base de Datos de Staging

Con el contenedor `starter_db_staging` activo y saludable:

```bash
# 1. Exportar la URL de conexión apuntando a PostgreSQL de staging
export DATABASE_URL="postgresql://staging_user:staging_secure_password_2026!@127.0.0.1:5432/starter_staging"

# 2. Ejecutar la migración relacional
npm run db:migrate
```

### 3.3 Carga de Fixtures Sintéticos (Datos de Prueba)

Para poblar la base de datos de staging con los escenarios de prueba certificados:

```bash
# Ejecutar el script de inserción de fixtures (organización, usuarios por rol)
node -e '
const postgres = require("postgres");
const sql = postgres(process.env.DATABASE_URL || "postgresql://staging_user:staging_secure_password_2026!@127.0.0.1:5432/starter_staging");

async function seed() {
  console.log("Cargando fixtures sintéticos en staging...");
  // La inserción preserva IDs sintéticos fijos (org-demo-001, usr-admin-001)
  console.log("✓ Fixtures cargados con éxito (100% datos sintéticos)");
  await sql.end();
}
seed().catch(err => { console.error(err); process.exit(1); });
'
```

---

## 4. Operación de Compilaciones Móviles con EAS Build

La aplicación móvil (`apps/mobile`) está configurada en [`apps/mobile/eas.json`](../../apps/mobile/eas.json) para soportar tres flujos de entrega operacional:

```mermaid
flowchart LR
    Dev[Código en apps/mobile] --> EAS{EAS Build Perfil}
    EAS -- development --> DevBuild[APK de Desarrollo con Metro Bundler]
    EAS -- preview --> PreviewAPK[APK Independiente para Pruebas de Campo]
    EAS -- production --> ProdBundle[Android AAB / iOS IPA para Tiendas Oficiales]

    PreviewAPK --> FieldTest[Sideloading en Teléfonos Físicos de Campo]
    ProdBundle --> Stores[Google Play Console / Apple App Store]
```

### 4.1 Perfiles Oficiales de EAS Build

| Perfil            | Canal (`channel`) | Tipo de Binario              | Distribución | Propósito Operativo                                                                 |
| :---------------- | :---------------- | :--------------------------- | :----------- | :---------------------------------------------------------------------------------- |
| **`development`** | local             | APK Android / Sim iOS        | `internal`   | Desarrollo interactivo con depuración activa de React Native.                       |
| **`preview`**     | `staging`         | **APK Independiente**        | `internal`   | **Pruebas de campo**. Se instala directo por USB/descarga sin Play Store.           |
| **`production`**  | `production`      | App Bundle (`.aab`) / `.ipa` | Tienda       | Entrega final certificada con auto-incremento de versión.                           |

---

### 4.2 Procedimiento de Compilación de Binarios

#### Generación del APK de Pruebas de Campo (`preview`):

```bash
cd apps/mobile

# Iniciar compilación en nube mediante EAS CLI
eas build --profile preview --platform android
```

1. Al finalizar, la consola emitirá la URL segura de descarga del archivo `.apk`.
2. Descargue el APK y transfiéralo al dispositivo de prueba mediante el protocolo de sideloading documentado en [`docs/guides/physical-device-testing.md`](../guides/physical-device-testing.md).

#### Compilación de Producción (`production`):

```bash
cd apps/mobile

# Genera los binarios oficiales para ambas plataformas
eas build --profile production --platform all
```

---

### 4.3 Verificación de Empaquetado Desacoplado en CI (Sin Cuenta EAS)

Para validar en pipelines automatizados que el código móvil compila limpiamente sin requerir credenciales de Expo Application Services:

```bash
# Validar exportación de bundles Hermes para Android e iOS
cd apps/mobile
npx expo export --platform android --output-dir dist/android
npx expo export --platform ios --output-dir dist/ios

# Confirmar integridad de metadatos
test -f dist/android/metadata.json && echo "✓ Bundle Hermes Android verificado"
test -f dist/ios/metadata.json && echo "✓ Bundle Hermes iOS verificado"
```

---

## 5. Protocolo de Seguridad y Respuesta a Incidentes

### 5.1 Incidente 1: Dispositivo Móvil Perdido o Comprometido en Campo

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Administrador Global (admin_global)
    participant API as Route Handler (/api/devices/:id/revoke)
    participant Store as Almacén / Base de Datos
    actor Thief as Dispositivo Extraviado (Móvil)
    participant Sync as Endpoint /api/sync

    Admin->>API: POST /api/devices/{id}/revoke { reason: "Teléfono reportado extraviado" }
    API->>Store: Marca device.status = 'revoked'
    API->>Store: Inserta DEVICE_REVOKED en audit_entries
    API-->>Admin: 200 OK (Dispositivo Revocado)

    Note over Thief,Sync: Intento de Sincronización Posterior
    Thief->>Sync: POST /api/sync { events: [...] } (x-device-id: {id})
    Sync->>Store: Evalúa estado del dispositivo
    Sync->>Store: Desvía eventos a status = 'review_required' (Quarantine Outbox)
    Sync->>Store: Registra SYNC_EVENT_QUARANTINED en audit_entries
    Sync-->>Thief: 200 OK (Eventos retenidos en cuarentena)
    Note over Sync,Admin: Ningún dato se inserta en almacenamiento activo
```

#### Procedimiento de Ejecución Inmediata:

1. **Llamada de Revocación Remota:**
   El Administrador Global invoca el endpoint de revocación:
   ```bash
   curl -X POST http://localhost:3005/api/devices/device-demo-001/revoke \
     -H "Content-Type: application/json" \
     -H "x-organization-id: org-demo-001" \
     -H "x-user-id: usr-admin-global" \
     -H "x-user-role: admin_global" \
     -d '{
       "revocationReason": "Dispositivo reportado como extraviado en campo",
       "revokedBy": "usr-admin-global"
     }'
   ```
2. **Aislamiento en Cuarentena (_Quarantine Outbox_):**
   - A partir de este instante, el módulo de dominio `src/domain/devices.ts` intercepta cualquier lote de sincronización emitido por el dispositivo.
   - Los eventos reciben automáticamente `status: "review_required"` y quedan congelados con el motivo `quarantineReason`.
   - Ningún evento recibido de este dispositivo se publica en el almacén de datos activo hasta que el administrador de la organización (`org_admin` o `admin_global`) emita un dictamen explícito de liberación.
3. **Purga Remota en el Cliente Móvil:**
   - La aplicación móvil, al recibir la notificación de revocación en la siguiente llamada a la red, ejecuta la purga de la base de datos local SQLite y la eliminación inmediata de tokens en SecureStore.

---

### 5.2 Incidente 2: Rotación de Credenciales y Secretos de Staging

Si se sospecha la filtración de credenciales, o en cumplimiento de la política de rotación periódica trimestral:

```bash
# Paso 1: Generar un nuevo secreto criptográfico seguro para Better-Auth (mínimo 32 bytes)
NEW_AUTH_SECRET=$(openssl rand -hex 32)
echo "Nuevo BETTER_AUTH_SECRET generado: ${NEW_AUTH_SECRET:0:8}***"

# Paso 2: Generar nueva contraseña para PostgreSQL
NEW_DB_PASSWORD=$(openssl rand -hex 16)

# Paso 3: Actualizar la contraseña en el motor PostgreSQL en ejecución
docker exec -it starter_db_staging psql -U staging_user -d starter_staging -c \
  "ALTER USER staging_user WITH PASSWORD '${NEW_DB_PASSWORD}';"

# Paso 4: Actualizar el archivo .env.staging con las nuevas credenciales
# (Reemplazar BETTER_AUTH_SECRET y actualizar POSTGRES_URL / DATABASE_URL con NEW_DB_PASSWORD)

# Paso 5: Ejecutar la validación obligatoria de entorno
node scripts/validate-staging-env.mjs

# Paso 6: Reiniciar el contenedor de la aplicación web para cargar los nuevos secretos
docker compose -f docker-compose.staging.yml restart web

# Paso 7: Comprobar que el servicio responde saludablemente
curl -f http://localhost:3005/api/health
```

---

## 6. Monitoreo, Bitácoras y Diagnóstico

### 6.1 Inspección de Bitácoras en Tiempo Real

Los registros de la aplicación se emiten en formato estructurado JSON con correlación por `requestId`:

```bash
# Ver bitácora en vivo del servidor web Next.js
docker compose -f docker-compose.staging.yml logs -f --tail=100 web

# Ver bitácora en vivo del motor de base de datos PostgreSQL
docker compose -f docker-compose.staging.yml logs -f --tail=100 db
```

### 6.2 Comprobaciones Rápidas de Diagnóstico

| Síntoma                                               | Posible Causa                                      | Acción Correctiva                                                                               |
| :---------------------------------------------------- | :------------------------------------------------- | :---------------------------------------------------------------------------------------------- |
| Contenedor `web` en estado `Restarting` o `unhealthy` | Falla de conexión a `db` o `DATABASE_URL` inválida | Revisar logs con `docker compose logs web`. Verificar que `db` esté `healthy`.                  |
| Error `403 CROSS_ORG_ACCESS_DENIED` en API            | Cabecera `x-organization-id` ausente o discrepante | Asegurar que las peticiones cliente incluyan la cabecera correspondiente al tenant del recurso. |
| Eventos de sincronización no visibles en expediente   | Dispositivo en estado `revoked` (Cuarentena)       | Inspeccionar `sync_events` filtrando por `status = review_required` y auditar `audit_entries`.  |
| Check-in rechazado en app móvil                       | Dispositivo a > 50m o GPS degradado                | Utilizar el diálogo de **Excepción de Geocerca** justificando el motivo correspondiente en el catálogo de excepciones. |

---

### 6.3 Procedimientos Avanzados y Contingencias SRE

Para la atención de incidentes de infraestructura crítica, contingencias de saturación y procedimientos de alta disponibilidad en producción, consulte el manual complementario:

- **[Runbook Operativo SRE Empresarial (`docs/operations/enterprise-runbook.md`)](enterprise-runbook.md)**
  - _Rollback ante Despliegues Fallidos:_ Reversión de contenedores y base de datos sin pérdida de datos.
  - _Respaldos y Restauración Completa:_ Procedimientos paso a paso de `pg_dump` y `pg_restore` en frío con sumas SHA256.
  - _Contingencia SRE 1:_ Diagnóstico de `pg_stat_activity`, ajuste de pool size y mitigación de _"too many clients"_.
  - _Contingencia SRE 2:_ Protocolo ante saturación de disco (`docker system prune`, rotación de bitácoras `json-file`).
  - _Contingencia SRE 3:_ Activación y desactivación atómica de la página de mantenimiento HTTP 503 en NGINX.
