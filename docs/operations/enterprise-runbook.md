# Runbook Operativo SRE: Gestión Empresarial, Contingencias y Resiliencia en Producción

## GS Vera Clinic / CareFlow HomeCare — v1.0.0

- **Versión del Runbook:** 1.0.0
- **Fecha de Certificación:** 2026-09-21
- **Base SHA Evaluada:** `18c101c`
- **Estado:** CANÓNICO (Aprobado para Operaciones de Producción y SRE)
- **Roles Responsables:** `sre-agent`, `devops-agent`, `infra-data-agent` en coordinación con `backend-agent` y `security-agent`
- **Infraestructura Base:** Servidor VPS Linux existente (Ubuntu 22.04 / 24.04 LTS) con **NGINX preexistente en el host**, Docker Engine `>=26.0` y Docker Compose v2.
- **Referencias Técnicas:** [`Dockerfile`](../../Dockerfile), [`docker-compose.staging.yml`](../../docker-compose.staging.yml), [`docker-compose.yml`](../../docker-compose.yml), [`docs/adr/ADR-005-docker-compose-orchestration.md`](../adr/ADR-005-docker-compose-orchestration.md), [`docs/operations/staging-deployment-runbook.md`](staging-deployment-runbook.md)

---

## 1. Propósito y Alcance Operativo

Este manual es la guía de procedimientos operativos estándar (_Standard Operating Procedures_ - SOP) y recuperación de contingencias de ingeniería de confiabilidad de sitios (_Site Reliability Engineering_ - SRE) para **GS Vera Clinic / CareFlow HomeCare**.

### 1.1 Premisa de Infraestructura Canónica

- **Entorno del Host:** Servidor virtual privado (VPS) Linux ya aprovisionado y en operación. **No se asume provisión de nueva infraestructura ni se introduce Caddy**, respetando la presencia del servidor web **NGINX preinstalado en el host** que gestiona certificados TLS y enruta hacia los contenedores locales.
- **Topología de Red Local:**
  - El contenedor web Next.js expone su servicio en `127.0.0.1:3005` (accesible únicamente desde el localhost del host).
  - El contenedor de PostgreSQL corre en la red interna privada de Docker (`5432` no expuesto públicamente).
  - NGINX en el host escucha en los puertos públicos `80` (HTTP) y `443` (HTTPS) con terminación TLS y enruta al backend mediante `proxy_pass http://127.0.0.1:3005`.

```mermaid
flowchart LR
    Internet((Clientes Web / Móvil)) -->|HTTPS :443| NGINX[NGINX Host<br/>SSL Certbot / Let's Encrypt]
    NGINX -->|proxy_pass :3005| WebApp[Contenedor Docker Web<br/>Next.js Standalone :3005]
    WebApp -->|DATABASE_URL :5432| DB[(Contenedor Docker DB<br/>PostgreSQL 18/16)]
    DB --> Vol[(Volumen Docker Persistente<br/>pgdata)]
```

---

## 2. Procedimiento de Arranque y Parada por Entorno

### 2.1 Entorno Local de Desarrollo

En la estación de trabajo de ingeniería:

```bash
# 1. Iniciar la base de datos PostgreSQL local en contenedor (puerto host 55432)
npm run db:up

# 2. Comprobar que la base de datos esté respondiendo
docker compose ps

# 3. Ejecutar las migraciones de esquema
npm run db:migrate

# 4. Iniciar la aplicación web en modo desarrollo
npm run dev

# Para detener el entorno de base de datos sin destruir datos:
npm run db:down
```

---

### 2.2 Entorno de Staging (Pre-Producción)

En el servidor de pruebas o staging:

```bash
# 1. Validar la configuración de variables sintéticas
node scripts/validate-staging-env.mjs

# 2. Compilar e iniciar los contenedores en segundo plano
docker compose -f docker-compose.staging.yml build --no-cache
docker compose -f docker-compose.staging.yml up -d

# 3. Comprobar la salud de los servicios
docker compose -f docker-compose.staging.yml ps

# 4. Verificar respuesta del endpoint de telemetría y salud
curl -i http://127.0.0.1:3005/api/health

# Para detener el servicio preservando la base de datos:
docker compose -f docker-compose.staging.yml down
# (ADVERTENCIA: NUNCA usar la bandera -v o --volumes)
```

---

### 2.3 Entorno de Producción

En el servidor VPS existente de producción:

```bash
# 1. Posicionarse en el directorio raíz del proyecto desplegado
cd /opt/careflow-homecare  # O ruta convenida en el host

# 2. Verificar que las variables de entorno de producción estén presentes y protegidas
ls -la .env.production
chmod 600 .env.production

# 3. Construir la imagen web optimizada multi-stage
docker compose -f docker-compose.staging.yml build web

# 4. Arrancar los contenedores en modo detached
docker compose -f docker-compose.staging.yml up -d

# 5. Confirmar que los procesos estén activos y saludables
docker compose -f docker-compose.staging.yml ps

# 6. Comprobar respuesta a través del proxy local y del dominio público
curl -f http://127.0.0.1:3005/api/health
curl -I https://app.veraclinic.com/api/health
```

---

## 3. Monitoreo e Inspección de Bitácoras

La aplicación emite registros estructurados en formato JSON a través del estándar `pino`, correlacionados mediante `requestId`.

### 3.1 Inspección de Bitácoras en Tiempo Real

```bash
# Ver bitácora unificada de todos los servicios con marcas temporales
docker compose -f docker-compose.staging.yml logs -f --tail=100 -t

# Filtrar exclusivamente los logs de la aplicación web Next.js
docker compose -f docker-compose.staging.yml logs -f --tail=200 web

# Filtrar bitácora del motor PostgreSQL
docker compose -f docker-compose.staging.yml logs -f --tail=100 db

# Inspeccionar logs de acceso y errores de NGINX en el host
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 3.2 Búsqueda de Errores Críticos y Correlación por `requestId`

```bash
# Buscar errores HTTP 500 o excepciones no capturadas en los últimos 500 registros
docker compose -f docker-compose.staging.yml logs --tail=500 web | grep -iE "error|exception|unhandled"

# Rastrear una transacción específica mediante su identificador de solicitud
REQ_ID="req-abc-123-xyz"
docker compose -f docker-compose.staging.yml logs web | grep "$REQ_ID"
```

---

## 4. Gestión Segura de Migraciones de Base de Datos y Plan de Rollback

Las migraciones del esquema relacional son administradas por Drizzle ORM / Drizzle Kit. Deben ejecutarse bajo un protocolo estricto que garantice idempotencia y capacidad de reversión inmediata.

### 4.1 Preparación y Respaldo Pre-Migración Obligatorio

**REGLA DE ORO SRE:** Jamás se ejecuta una migración de esquema en producción sin haber generado un snapshot de respaldo inmediatamente previo.

```bash
# 1. Crear directorio de respaldos si no existe
sudo mkdir -p /var/backups/careflow_db

# 2. Generar backup puntual de contingencia antes de migrar
BACKUP_TIMESTAMP=$(date +%Y%m%d_%H%M%S)
docker exec careflow_db_staging pg_dump -U staging_careflow_user careflow_staging | gzip > "/var/backups/careflow_db/pre_migration_${BACKUP_TIMESTAMP}.sql.gz"

# 3. Verificar que el respaldo tenga tamaño válido y no esté vacío
test -s "/var/backups/careflow_db/pre_migration_${BACKUP_TIMESTAMP}.sql.gz" && echo "✓ Respaldo previo generado exitosamente"
```

### 4.2 Ejecución de la Migración

```bash
# Exportar la variable de conexión apuntando a la base de datos objetivo
export DATABASE_URL="postgresql://staging_careflow_user:staging_mock_secure_password_careflow_2026!@127.0.0.1:5432/careflow_staging"

# Ejecutar la migración relacional Drizzle
npm run db:migrate
```

### 4.3 Plan de Rollback de Migración Fallida

Si la migración arroja un error de sintaxis, bloqueo de tablas (_lock timeout_) o inconsistencia de tipos:

1. **Detener tráfico de escritura:** Activar la página de mantenimiento en NGINX (ver Sección 9.3).
2. **Restaurar el snapshot pre-migración:**

   ```bash
   # Detener el contenedor de la aplicación web para evitar conexiones activas
   docker compose -f docker-compose.staging.yml stop web

   # Restaurar el estado previo de la base de datos
   gunzip -c "/var/backups/careflow_db/pre_migration_${BACKUP_TIMESTAMP}.sql.gz" | \
     docker exec -i careflow_db_staging psql -U staging_careflow_user -d careflow_staging

   # Reiniciar la aplicación web con la versión anterior estable
   docker compose -f docker-compose.staging.yml start web
   ```

3. **Validar consistencia:**
   ```bash
   curl -f http://127.0.0.1:3005/api/health
   ```
4. **Desactivar página de mantenimiento en NGINX.**

---

## 5. Respaldo y Restauración Integral de Base de Datos

### 5.1 Procedimiento de Respaldo Completo (`pg_dump`)

El respaldo incluye esquema, tablas relacionales, datos de auditoría e índices JSONB.

```bash
# Parámetros de respaldo
BACKUP_DIR="/var/backups/careflow_db"
BACKUP_FILE="${BACKUP_DIR}/careflow_full_$(date +%Y%m%d_%H%M%S).sql.gz"

# Ejecución con pg_dump comprimido
docker exec careflow_db_staging pg_dump \
  -U staging_careflow_user \
  --format=plain \
  --no-owner \
  --no-acl \
  careflow_staging | gzip -9 > "${BACKUP_FILE}"

# Generar checksum SHA256 para verificación de integridad
sha256sum "${BACKUP_FILE}" > "${BACKUP_FILE}.sha256"

echo "Respaldo completado: ${BACKUP_FILE}"
```

#### Automatización con Cron Job Diario (ejecución a las 03:00 AM UTC):

```bash
# Agregar a crontab de root (sudo crontab -e):
0 3 * * * docker exec careflow_db_staging pg_dump -U staging_careflow_user --no-owner --no-acl careflow_staging | gzip -9 > /var/backups/careflow_db/careflow_backup_$(date +\%Y\%m\%d).sql.gz && find /var/backups/careflow_db -name "*.sql.gz" -mtime +30 -delete
```

---

### 5.2 Procedimiento de Restauración en Frío (`pg_restore` / `psql`)

```bash
# Paso 1: Notificar y activar ventana de mantenimiento
sudo touch /var/www/maintenance.flag

# Paso 2: Detener el contenedor de la aplicación web
docker compose -f docker-compose.staging.yml stop web

# Paso 3: Verificar la integridad del archivo de respaldo
sha256sum -c /var/backups/careflow_db/archivo_a_restaurar.sql.gz.sha256

# Paso 4: Limpiar y recrear la base de datos destino en el contenedor
docker exec -i careflow_db_staging psql -U staging_careflow_user -d postgres -c \
  "DROP DATABASE IF EXISTS careflow_staging;"
docker exec -i careflow_db_staging psql -U staging_careflow_user -d postgres -c \
  "CREATE DATABASE careflow_staging OWNER staging_careflow_user;"

# Paso 5: Descomprimir y restaurar los datos
gunzip -c /var/backups/careflow_db/archivo_a_restaurar.sql.gz | \
  docker exec -i careflow_db_staging psql -U staging_careflow_user -d careflow_staging

# Paso 6: Reiniciar y reanudar el contenedor web
docker compose -f docker-compose.staging.yml start web

# Paso 7: Comprobar salud del sistema y desactivar mantenimiento
curl -f http://127.0.0.1:3005/api/health
sudo rm -f /var/www/maintenance.flag
```

---

## 6. Rotación de Secretos y Cambio de Contraseñas

### 6.1 Rotación del Secreto de Autenticación (`BETTER_AUTH_SECRET`)

El secreto criptográfico debe renovarse cada 90 días o inmediatamente ante cualquier sospecha de filtración:

```bash
# 1. Generar un nuevo secreto aleatorio de 32 bytes (64 caracteres hexadecimales)
NEW_SECRET=$(openssl rand -hex 32)

# 2. Actualizar la variable BETTER_AUTH_SECRET en el archivo de entorno (.env.production o .env.staging)
sed -i "s/^BETTER_AUTH_SECRET=.*/BETTER_AUTH_SECRET=${NEW_SECRET}/" .env.staging

# 3. Ejecutar el validador oficial de entorno
node scripts/validate-staging-env.mjs

# 4. Reiniciar de forma atómica el contenedor web para cargar el nuevo secreto
docker compose -f docker-compose.staging.yml restart web

# 5. Comprobar que el endpoint de salud responda satisfactoriamente
curl -f http://127.0.0.1:3005/api/health
```

_Nota Operativa:_ La rotación de `BETTER_AUTH_SECRET` invalida de forma inmediata todas las sesiones activas, requiriendo que los usuarios vuelvan a iniciar sesión. Debe coordinarse preferentemente fuera de los horarios pico de turnos de enfermería.

---

### 6.2 Cambio de Contraseña de Base de Datos PostgreSQL

```bash
# 1. Generar nueva contraseña segura
NEW_DB_PASS=$(openssl rand -base64 24 | tr -dc 'a-zA-Z0-9' | head -c 20)

# 2. Modificar la contraseña en el motor PostgreSQL en caliente
docker exec -i careflow_db_staging psql -U staging_careflow_user -d careflow_staging -c \
  "ALTER USER staging_careflow_user WITH PASSWORD '${NEW_DB_PASS}';"

# 3. Actualizar la contraseña en el archivo de entorno (.env.staging / .env.production)
# Actualizar los valores de POSTGRES_PASSWORD, POSTGRES_URL y DATABASE_URL

# 4. Reiniciar el servicio web para que reconecte con la nueva credencial
docker compose -f docker-compose.staging.yml restart web

# 5. Verificar conectividad en la bitácora
docker compose -f docker-compose.staging.yml logs --tail=20 web
```

---

## 7. Procedimiento de Rollback Inmediato ante Despliegues Fallidos

Si tras un nuevo despliegue el endpoint `/api/health` retorna código de error (HTTP 500) o los contenedores entran en bucle de reinicio (`Restarting` / `CrashLoopBackOff`):

```bash
# 1. Identificar el commit estable anterior en el historial git
PREV_STABLE_SHA=$(git rev-parse HEAD~1)
echo "Retrocediendo a versión estable: ${PREV_STABLE_SHA}"

# 2. Retornar el código fuente al commit estable
git checkout "${PREV_STABLE_SHA}"

# 3. Reconstruir la imagen web con la versión previa
docker compose -f docker-compose.staging.yml build web

# 4. Reemplazar el contenedor web de forma atómica sin tocar la base de datos
docker compose -f docker-compose.staging.yml up -d --no-deps web

# 5. Verificar recuperación inmediata del servicio
curl -i http://127.0.0.1:3005/api/health

# 6. Registrar el incidente en artifacts/debug/ con causa raíz y logs de falla
```

---

## 8. Contingencias SRE Operativas

---

### 8.1 Contingencia SRE 1: Saturación de Conexiones (_Too Many Clients_)

**Síntoma:** Los registros muestran `FATAL: remaining connection slots are reserved for non-replicated superuser connections` o `sorry, too many clients already`.

#### Paso 1: Diagnóstico en Tiempo Real de Conexiones

Conéctate a la base de datos mediante el usuario administrador:

```bash
docker exec -i careflow_db_staging psql -U staging_careflow_user -d careflow_staging -c "
SELECT count(*), state, client_addr, usename, application_name
FROM pg_stat_activity
GROUP BY state, client_addr, usename, application_name
ORDER BY count(*) DESC;
"
```

#### Paso 2: Identificar y Terminar Conexiones Ociosas o Bloqueadas

Si existen transacciones colgadas en estado `idle in transaction` consumiendo slots:

```bash
# Terminar conexiones ociosas con más de 5 minutos de inactividad
docker exec -i careflow_db_staging psql -U staging_careflow_user -d careflow_staging -c "
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE state = 'idle in transaction'
  AND current_timestamp - state_change > interval '5 minutes';
"
```

#### Paso 3: Ajustar Temporalmente `max_connections` en PostgreSQL

Si la carga legítima aumentó y la memoria RAM del VPS lo tolera:

```bash
docker exec -i careflow_db_staging psql -U staging_careflow_user -d careflow_staging -c \
  "ALTER SYSTEM SET max_connections = '150';"

# Reiniciar el servicio de base de datos para aplicar
docker compose -f docker-compose.staging.yml restart db
```

#### Paso 4: Mitigación de Fondo mediante PgBouncer

Para prevenir la recurrencia, la cadena de conexión de la aplicación web en producción debe limitar el pool local (`max: 10` conexiones por instancia en `src/db/index.ts`) o dirigir el tráfico a través de un pooler **PgBouncer** configurado en modo `pool_mode = transaction`.

---

### 8.2 Contingencia SRE 2: Saturación de Espacio en Disco (Alerta 85% / 95%)

**Síntoma:** El comando `df -h /` indica uso de disco mayor al 85%, o Docker falla con el error `no space left on device`.

#### Paso 1: Diagnóstico del Espacio Ocupado

```bash
# 1. Comprobar uso de particiones
df -h

# 2. Identificar el consumo dentro del directorio de Docker
sudo du -sh /var/lib/docker/* 2>/dev/null | sort -hr | head -n 10

# 3. Listar archivos temporales pesados
sudo du -sh /tmp/* /var/tmp/* 2>/dev/null | sort -hr | head -n 5
```

#### Paso 2: Limpieza Segura de Docker (Sin Borrar Volúmenes de BD)

Ejecuta la purga controlada de imágenes no utilizadas y caché de compilación:

```bash
# Purga imágenes huérfanas, contenedores detenidos y redes inactivas
# PRECAUCIÓN CRÍTICA: NUNCA usar --volumes en producción para no destruir los datos persistentes
docker system prune -f --volumes=false

# Limpiar caché de compilación de BuildKit
docker builder prune -f
```

#### Paso 3: Rotación y Truncado de Archivos de Logs de Contenedores

Si los archivos de registro JSON de Docker han crecido desmedidamente:

```bash
# Localizar y truncar de forma segura los archivos de bitácora de Docker
sudo find /var/lib/docker/containers/ -name "*-json.log" -type f -exec truncate -s 0 {} +

# Configurar rotación obligatoria en /etc/docker/daemon.json para prevenir recurrencia:
sudo bash -c 'cat << "EOF" > /etc/docker/daemon.json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "50m",
    "max-file": "3"
  }
}
EOF'

# Recargar la configuración del daemon de Docker sin reiniciar los contenedores activos
sudo systemctl reload docker
```

#### Paso 4: Vaciado de Paquetes del Sistema y Temporales

```bash
sudo apt clean
sudo apt autoremove -y
sudo rm -rf /tmp/* /var/tmp/*
```

---

### 8.3 Contingencia SRE 3: Página de Mantenimiento HTTP 503 en NGINX

Durante intervenciones críticas, restauraciones de base de datos o caídas mayores, NGINX en el host debe retornar una página de estado HTTP 503 informando a los usuarios y coordinadores médicos que el sistema se encuentra en mantenimiento programado.

#### Configuración Previa de NGINX en el Host (`/etc/nginx/sites-available/careflow`):

```nginx
# Fragmento canónico de configuración del VirtualHost en el servidor NGINX
server {
    listen 80;
    listen 443 ssl http2;
    server_name app.veraclinic.com;

    # Certificados SSL gestionados en el host
    ssl_certificate /etc/letsencrypt/live/app.veraclinic.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app.veraclinic.com/privkey.pem;

    # Bandera de mantenimiento del sistema
    set $maintenance 0;
    if (-f /var/www/maintenance.flag) {
        set $maintenance 1;
    }

    # Permitir bypass para la IP de guardia de SRE / Soporte Técnico
    # if ($remote_addr ~* "203.0.113.10") {
    #     set $maintenance 0;
    # }

    error_page 503 @maintenance_page;
    location @maintenance_page {
        root /var/www;
        rewrite ^(.*)$ /maintenance.html break;
    }

    location / {
        if ($maintenance = 1) {
            return 503;
        }

        proxy_pass http://127.0.0.1:3005;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### Plantilla HTML de Mantenimiento (`/var/www/maintenance.html`):

```bash
sudo bash -c 'cat << "EOF" > /var/www/maintenance.html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Mantenimiento Programado — GS Vera Clinic</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: system-ui, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
    .card { background: #1e293b; padding: 2.5rem; border-radius: 12px; border: 1px solid #334155; max-width: 480px; text-align: center; box-shadow: 0 10px 25px rgba(0,0,0,0.3); }
    h1 { color: #38bdf8; font-size: 1.5rem; margin-bottom: 1rem; }
    p { color: #94a3b8; font-size: 0.95rem; line-height: 1.5; }
    .badge { display: inline-block; background: #0369a1; color: #e0f2fe; padding: 0.3rem 0.8rem; border-radius: 9999px; font-size: 0.8rem; margin-top: 1.5rem; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Ventana de Mantenimiento Clínico</h1>
    <p>La plataforma <strong>GS Vera Clinic / CareFlow HomeCare</strong> se encuentra temporalmente en actualización para optimizar la seguridad y disponibilidad de los servicios asistenciales.</p>
    <p>Las órdenes de trabajo y atenciones continuarán registrándose en las terminales móviles en modo fuera de línea.</p>
    <div class="badge">Estado: HTTP 503 Service Unavailable</div>
  </div>
</body>
</html>
EOF'
```

#### Procedimiento de Activación y Desactivación:

```bash
# ACTIVAR MANTENIMIENTO: Crea la bandera atómicamente
sudo touch /var/www/maintenance.flag

# Verificar que NGINX responde HTTP 503 de inmediato
curl -I https://app.veraclinic.com/
# (Debe retornar: HTTP/2 503)

# -------------------------------------------------------------------
# (Aquí el equipo SRE ejecuta las labores de migración, restauración o mantenimiento)
# -------------------------------------------------------------------

# DESACTIVAR MANTENIMIENTO: Elimina la bandera atómicamente
sudo rm -f /var/www/maintenance.flag

# Verificar que el servicio público está restaurado y operativo
curl -I https://app.veraclinic.com/
# (Debe retornar: HTTP/2 200)
```

---

## 9. Matriz de Síntomas, Diagnósticos y Escalamiento SRE

| Síntoma Detectado              | Causa Raíz Probable                                  | Verificación / Diagnóstico                                    | Acción Operativa Inmediata                                                                         | Rol Responsable                      |
| :----------------------------- | :--------------------------------------------------- | :------------------------------------------------------------ | :------------------------------------------------------------------------------------------------- | :----------------------------------- |
| **HTTP 502 Bad Gateway**       | Contenedor web detenido o puerto 3005 inaccesible    | `docker compose ps` y `curl http://127.0.0.1:3005/api/health` | Reiniciar contenedor web: `docker compose restart web`. Revisar logs de crash.                     | `sre-agent` / `devops-agent`         |
| **HTTP 503 en toda la app**    | Bandera `/var/www/maintenance.flag` presente         | `ls -l /var/www/maintenance.flag`                             | Comprobar si hay ventana programada; si finalizó, remover con `sudo rm /var/www/maintenance.flag`. | `sre-agent`                          |
| **"too many clients" en BD**   | Fuga de conexiones o pico de peticiones concurrentes | Consultar `pg_stat_activity` en PostgreSQL                    | Purgar conexiones ociosas; elevar transitoriamente `max_connections` y configurar PgBouncer.       | `infra-data-agent` / `sre-agent`     |
| **"no space left on device"**  | Acumulación de imágenes de Docker o bitácoras JSON   | `df -h` y `du -sh /var/lib/docker/*`                          | Ejecutar `docker system prune -f` y truncar logs con `truncate -s 0`.                              | `sre-agent` / `devops-agent`         |
| **Falla en migración Drizzle** | Discrepancia de tipos o bloqueo de tabla             | Salida de `npm run db:migrate`                                | Activar 503, ejecutar Rollback de base de datos desde snapshot previo y reiniciar app.             | `backend-agent` / `infra-data-agent` |
| **403 Cross-Org Denied**       | Discrepancia de `x-organization-id`                  | Bitácoras JSON del contenedor web con `requestId`             | Verificar configuración del cliente o cabecera transmitida por la app móvil.                       | `backend-agent`                      |
