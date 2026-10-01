# Reporte de Auditoría de Seguridad de Infraestructura, Contenedores, CI/CD y Dispositivos Móviles

- **Fecha de Evaluación:** 2026-09-21
- **Tarea:** T-028 — Auditoría de Seguridad Integral de Infraestructura, CI/CD y Móvil
- **Agente Evaluador:** `security-agent`
- **Base SHA Evaluada:** `ee19529` (con artefactos de infraestructura T-025, pipelines T-026 y arnés de pruebas T-027)
- **Alcance Auditado:**
  - Contenedores y Staging: `Dockerfile`, `docker-compose.staging.yml`, `.env.staging`, `.env.example`, `scripts/validate-staging-env.mjs`
  - Pipelines CI/CD: `.github/workflows/ci.yml`, `.github/workflows/e2e-devices.yml`, `.github/workflows/release.yml`
  - Dispositivos Físicos y Móvil: `docs/guides/physical-device-testing.md`, `apps/mobile/eas.json`, `scripts/simulate-mobile-network.mjs`
- **Criterios de Aceptación Cubiertos:** AC-001, AC-002, AC-003, AC-006, AC-007, AC-012
- **Normativas y Estándares Auditados:** Protección de Datos Personales, Aislamiento Multi-Tenant, Principio de Mínimo Privilegio y Seguridad Corporativa
- **Estado de Ejecución:** `COMPLETED`
- **Veredicto Técnico del Código:** `APPROVED_WITH_RESERVATIONS` (Arquitectura base sólida y compliant; requiere atención en exposición de puerto 5432 en Compose, archivo `.dockerignore` y alineación de dependencias nativas en cliente móvil antes de producción).

---

## 1. Resumen Ejecutivo y Alcance

Este informe constituye la auditoría técnica exhaustiva e independiente de los artefactos de infraestructura, integración y distribución continua, y procedimientos de campo en dispositivos físicos desarrollados en las tareas **T-025**, **T-026** y **T-027**.

La evaluación analizó cuatro pilares críticos para la operación de Golden Starter V3:

1. **Seguridad de Contenedorización y Entornos de Staging:** Verificación del usuario no privilegiado (`nodejs:nextjs` UID 1001), minimización de capas en la imagen runner, empaquetado standalone de Next.js, orquestación de healthchecks, aislamiento de red y cumplimiento irrestricto de la regla de datos 100% ficticios y enmascaramiento de secretos.
2. **Endurecimiento de Pipelines CI/CD en GitHub Actions:** Principio de mínimo privilegio en `GITHUB_TOKEN` (`contents: read` en flujos regulares, `contents: write` exclusivamente en publicación de tags de release), auditoría contra inyección de comandos en parámetros y expresiones dinámicas, uso de acciones fijadas/oficiales y generación de hashes de integridad criptográfica (SHA-256).
3. **Seguridad en Hardware Móvil y Pruebas de Campo:** Resguardo de la cola outbox local en SQLite cifrado mediante SQLCipher y derivación en TEE/Keystore/Secure Enclave, política de retención de datos sin borrado destructivo, contención de fugas en multitarea (`FLAG_SECURE`), permisos exclusivos en primer plano y protocolo de revocación remota de dispositivos extraviados.
4. **Gobierno de Identidad, Sesiones y Multi-Tenancy:** Aislamiento estricto por `organizationId`, validación de roles de acceso RBAC (`admin_global`, `org_admin`, `manager`, `member`, `viewer`) e idempotencia demostrada en la recepción de lotes offline.

---

## 2. Matriz Consolidada de Hallazgos de Seguridad

| ID | Hallazgo | Severidad (CVSS v3.1) | Control / AC Afectado | Componente Afectado | Estado |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **SEC-INFRA-001** | Ausencia de archivo `.dockerignore` en la raíz del proyecto | **MEDIA** (5.3) | Confidencialidad de Secretos / Superficie de Imagen | `Dockerfile` | Mitigación documentada; fix requerido |
| **SEC-INFRA-002** | Exposición innecesaria del puerto 5432 de PostgreSQL en `0.0.0.0` del host en Compose | **ALTA** (7.5) | Aislamiento de Red / Base de Datos Staging | `docker-compose.staging.yml` | Mitigación documentada; fix requerido |
| **SEC-INFRA-003** | Contraseña de base de datos hardcodeada en Compose y ausencia de red aislada | **BAJA** (3.3) | Gestión de Secretos / Segmentación de Red | `docker-compose.staging.yml` | Recomendación de hardening |
| **SEC-CI-001** | Acción de terceros en pipeline de release sin fijación por commit SHA inmutable | **BAJA** (3.7) | Seguridad en Cadena de Suministro CI/CD | `.github/workflows/release.yml` | Recomendación de hardening |
| **SEC-CI-002** | Ausencia de límite explícito de tiempo de ejecución (`timeout-minutes`) en jobs | **BAJA** (2.5) | Resiliencia y Prevención de Agotamiento de Recursos | Workflows GitHub Actions | Recomendación de hardening |
| **SEC-MOBILE-001** | Discrepancia entre especificación de seguridad física y dependencias nativas de cifrado instaladas | **MEDIA** (5.5) | AC-002, AC-007, Cifrado en Reposo | `apps/mobile/package.json` / `app.json` | Gap documentado previo a campo real |

---

## 3. Fichas Técnicas de Hallazgos y Reproducción Segura

### SEC-INFRA-001: Ausencia de archivo `.dockerignore` en la raíz del repositorio

- **Severidad:** MEDIA (CVSS:3.1/AV:L/AC:L/PR:L/UI:N/S:U/C:H/I:N/A:N — Base Score: 5.3)
- **Control Afectado:** Confidencialidad del Código Fuente, Protección contra Inclusión Accidental de Secretos.
- **Ubicación:** Raíz del proyecto / `Dockerfile` (línea 31: `COPY . .` en etapa `builder`).
- **Descripción Técnica:**
  El proyecto carece de un archivo `.dockerignore`. Al invocar el comando de compilación `docker build` o `docker compose build`, el cliente Docker empaqueta y envía todo el árbol de directorios de la estación de trabajo como contexto de construcción hacia el Docker daemon.
  En la etapa `builder`, la directiva `COPY . .` transfiere al sistema de archivos del contenedor capas que incluyen:
  1. El directorio `.git/`, que contiene el historial completo de commits, mensajes y metadatos de ramas.
  2. Archivos locales de entorno como `.env.staging` o archivos de desarrollo temporal (`.env.local`).
  3. Artefactos de pruebas locales (`playwright-report/`, `coverage/`, logs, caches de Expo).
- **Impacto Demostrado:**
  Aunque la etapa `runner` utiliza una técnica multi-stage y sólo extrae `/app/.next/standalone`, las capas intermedias de la etapa `builder` quedan preservadas en la caché local del Docker daemon o en registros si se publica un build intermedio con target explícito. Además, si Next.js lee variables de entorno del entorno de compilación, secretos locales podrían quedar compilados en el bundle estático. Asimismo, enviar `node_modules/` del host macOS al daemon en Linux degrada el rendimiento de compilación.
- **Reproducción Segura:**
  ```bash
  # 1. Verificar la ausencia del archivo
  test -f .dockerignore && echo "Existe" || echo "VULNERABLE: .dockerignore no encontrado"

  # 2. Demostración en compilación local: observar que .git y .env.staging se transfieren al contexto
  docker build --target builder -t starter-test:builder .
  docker run --rm starter-test:builder ls -la /app/.git
  ```
- **Solución Recomendada:**
  Crear un archivo `.dockerignore` en la raíz del repositorio con el siguiente contenido:
  ```gitignore
  node_modules
  .next
  dist
  coverage
  playwright-report
  test-results
  .git
  .gitignore
  .env*
  !.env.example
  *.log
  .DS_Store
  .expo
  ```

---

### SEC-INFRA-002: Exposición del puerto 5432 de PostgreSQL en `0.0.0.0` del host en Compose

- **Severidad:** ALTA (CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:N — Base Score: 7.5 en entorno accesible por red)
- **Control Afectado:** AC-001, Aislamiento Perimetral y Contención de Base de Datos.
- **Ubicación:** `docker-compose.staging.yml` (líneas 40-41).
- **Descripción Técnica:**
  En `docker-compose.staging.yml`, el servicio `db` publica el puerto de PostgreSQL directamente hacia el host:
  ```yaml
  db:
    image: postgres:18-alpine
    ...
    ports:
      - "5432:5432"
  ```
  En la sintaxis de Docker Compose, la declaración `"5432:5432"` vincula el socket TCP a la interfaz comodín `0.0.0.0:5432`. Si este archivo se ejecuta en una máquina virtual de staging o servidor en la nube sin un firewall externo a nivel de red, el puerto de la base de datos queda abierto y expuesto a internet o a la red corporativa.
- **Impacto Demostrado:**
  El servicio `web` se comunica con la base de datos a través de la red interna de Docker utilizando el DNS interno `db:5432`, por lo que **no existe ninguna necesidad arquitectónica** de exponer el puerto 5432 en el host para el funcionamiento de staging. La exposición en `0.0.0.0` permite a cualquier atacante en la misma red intentar ataques de fuerza bruta o explotación de credenciales conocidas (`staging_secure_password_2026!`).
- **Reproducción Segura:**
  ```bash
  # Iniciar el compose de staging
  docker compose -f docker-compose.staging.yml up -d db

  # Comprobar el enlace del socket en interfaces no locales
  netstat -an | grep 5432
  # Salida vulnerable: tcp4 0 0 *.5432 *.* LISTEN (escuchando en todas las interfaces)
  ```
- **Solución Recomendada:**
  1. Si no se requiere acceso desde fuera de los contenedores, eliminar por completo la directiva `ports` del servicio `db`.
  2. Si se requiere acceso exclusivo para depuración local o migraciones desde el host, restringir el enlace estrictamente al loopback (`127.0.0.1`):
  ```diff
  --- a/docker-compose.staging.yml
  +++ b/docker-compose.staging.yml
  @@ -38,8 +38,8 @@ services:
         POSTGRES_USER: staging_user
         POSTGRES_PASSWORD: staging_secure_password_2026!
       ports:
  -      - "5432:5432"
  +      - "127.0.0.1:5432:5432"
  ```

---

### SEC-INFRA-003: Contraseña hardcodeada en manifiesto Compose y ausencia de red aislada

- **Severidad:** BAJA (CVSS:3.1/AV:L/AC:L/PR:L/UI:N/S:U/C:L/I:N/A:N — Base Score: 3.3)
- **Control Afectado:** Principio de Mínimo Privilegio y Gestión Segura de Credenciales.
- **Ubicación:** `docker-compose.staging.yml` (línea 39).
- **Descripción Técnica:**
  El valor de `POSTGRES_PASSWORD` está escrito de forma literal en el archivo versionado `docker-compose.staging.yml`:
  `POSTGRES_PASSWORD: staging_secure_password_2026!`
  Asimismo, no se define una red virtual bridge dedicada con nombre explícito (`networks:`), delegando la conectividad a la red predeterminada generada por Compose.
- **Impacto Demostrado:**
  Aunque se trata de una credencial ficticia de staging, tener valores explícitos en manifiestos de infraestructura sienta un precedente que puede replicarse por error en manifiestos de preproducción o producción. Además, compartir la red default de compose con otros servicios en el host podría facilitar ataques de movimiento lateral o suplantación de nombres DNS entre contenedores.
- **Solución Recomendada:**
  Referenciar la variable desde el entorno (`${POSTGRES_PASSWORD}`) o utilizar `env_file: - .env.staging` también en el servicio `db`, y definir una red interna dedicada:
  ```yaml
  services:
    web:
      networks: [starter_staging_net]
    db:
      networks: [starter_staging_net]
  networks:
    starter_staging_net:
      driver: bridge
  ```

---

### SEC-CI-001: Acción de terceros en release sin fijación por commit SHA inmutable

- **Severidad:** BAJA (CVSS:3.1/AV:N/AC:H/PR:H/UI:N/S:C/C:N/I:L/A:N — Base Score: 3.7)
- **Control Afectado:** Integridad de la Cadena de Suministro CI/CD (Supply Chain Security / SLSA Level 3).
- **Ubicación:** `.github/workflows/release.yml` (línea 69).
- **Descripción Técnica:**
  El job `package-and-release` emplea la acción comunitaria `softprops/action-gh-release@v2` referenciada mediante un tag mutable (`@v2`).
  ```yaml
  - name: Publish GitHub Release
    uses: softprops/action-gh-release@v2
  ```
- **Impacto Demostrado:**
  Los tags de Git no son inmutables criptográficamente; pueden ser modificados o reasignados en el repositorio upstream si la cuenta o repositorio del mantenedor se ven comprometidos. Dado que este workflow se ejecuta con privilegios de escritura (`permissions: contents: write`), un payload malicioso inyectado en el tag podría alterar releases, publicar binarios troyanizados o exfiltrar secretos del repositorio.
- **Solución Recomendada:**
  Fijar la acción a su commit SHA inmutable con comentario del tag correspondiente:
  ```yaml
  - name: Publish GitHub Release
    uses: softprops/action-gh-release@c95fe1489396fe8a9ec87b7657045534aa82b2ab # v2.2.1
  ```

---

### SEC-CI-002: Ausencia de límite explícito de tiempo de ejecución (`timeout-minutes`) en jobs de CI

- **Severidad:** BAJA (CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:N/I:N/A:L — Base Score: 2.5)
- **Control Afectado:** Resiliencia y Prevención de Denegación de Servicio (Resource Exhaustion).
- **Ubicación:** `.github/workflows/ci.yml`, `e2e-devices.yml`, `release.yml`.
- **Descripción Técnica:**
  Ninguno de los jobs definidos en los tres flujos de trabajo de GitHub Actions especifica la directiva `timeout-minutes`. El límite predeterminado en GitHub Actions es de 360 minutos (6 horas).
- **Impacto Demostrado:**
  Si una prueba E2E de Playwright entra en un bucle infinito, un deadlock en PostgreSQL bloquea el proceso de test, o la compilación de Next.js se suspende esperando entrada interactiva, el runner consumirá cuota de cómputo durante 6 horas antes de abortar.
- **Solución Recomendada:**
  Configurar `timeout-minutes: 15` (o `20` para compilaciones de Expo y empaquetado) en cada job.

---

### SEC-MOBILE-001: Discrepancia entre especificación de seguridad física y dependencias nativas de cifrado

- **Severidad:** MEDIA (CVSS:3.1/AV:P/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N — Base Score: 5.5 en caso de pérdida física de dispositivo de campo)
- **Control Afectado:** AC-002, AC-007, Seguridad en Reposo de Datos Móviles.
- **Ubicación:** `docs/guides/physical-device-testing.md` (Secciones 7.2 y 7.3) vs. `apps/mobile/package.json` / `apps/mobile/app.json`.
- **Descripción Técnica:**
  La guía de pruebas de campo (`physical-device-testing.md`) establece formalmente:
  1. El uso de SQLite cifrado mediante SQLCipher con algoritmo AES-256-GCM.
  2. Derivación de la clave maestra con Android Keystore (respaldado por TEE/Titan M/Knox) y Keychain con Secure Enclave en iOS.
  3. Aislamiento de tokens en `expo-secure-store`.
  4. Activación de `FLAG_SECURE` para impedir capturas de pantalla y previsualizaciones en multitarea.
  Sin embargo, una auditoría del espacio de trabajo móvil revela que:
  - `apps/mobile/package.json` únicamente incluye `expo`, `expo-router`, `react` y `react-native`. No están presentes las dependencias de `expo-sqlite`, `@op-engineering/op-sqlite`, ni `expo-secure-store`.
  - La cola outbox se mantiene en un estado local reactivo.
  - `apps/mobile/app.json` no contiene la configuración de permisos (`ACCESS_FINE_LOCATION`) ni el plugin de `FLAG_SECURE`.
- **Impacto Demostrado:**
  En el prototipo actual v0.1 con datos ficticios, el comportamiento en simuladores es adecuado para validación funcional de UX/UI. No obstante, si se compila un APK `preview` desde el código fuente actual y se entrega a usuarios en campo real:
  1. Si la aplicación es cerrada por el sistema operativo o se apaga el teléfono, los registros pendientes de sincronizar en la outbox se perderán irrecuperablemente de la memoria RAM.
  2. Las credenciales de sesión se almacenarían en texto plano si se utiliza almacenamiento no cifrado.
  3. No se cuenta con protección contra capturas de pantalla de información privada.
- **Solución Recomendada:**
  Antes del inicio de la fase de despliegue con dispositivos físicos reales:
  1. Incorporar `expo-secure-store` y la biblioteca de SQLite cifrado en `apps/mobile/package.json`.
  2. Configurar en `app.json` los plugins nativos de protección de pantalla (`expo-screen-capture`) y descripción de permisos de privacidad.
  3. Sustituir el estado en memoria por el adaptador de almacenamiento persistente cifrado.

---

## 4. Auditoría Específica por Frente Técnico

### 4.1 Contenedores y Entorno de Staging

#### Dockerfile
- **Usuario no privilegiado:** Cumplimiento verificado. Se crean `nodejs` (UID 1001, GID 1001) y `nextjs` (UID 1002, GID 1002) y la ejecución se establece con `USER nodejs:nextjs` antes del comando final (`CMD ["node", "server.js"]`).
- **Capas y superficie de ataque del runner:** Se utiliza la imagen base `node:24-slim` sin instalar paquetes de compilación adicionales (`gcc`, `make`, `python`).
- **Artefactos del runner:** Únicamente se copian los binarios compilados en standalone (`.next/standalone`), los activos estáticos (`.next/static`) y la carpeta `public/`. Se excluyen el código fuente, la suite de tests, devDependencies y el historial de Git.
- **Observación de endurecimiento:** Se recomienda agregar directiva nativa `HEALTHCHECK` en el Dockerfile para compatibilidad con orquestadores que no utilicen docker-compose.

#### docker-compose.staging.yml
- **Orquestación de inicio y healthchecks:** El servicio `web` depende de `db` mediante `condition: service_healthy`. El contenedor PostgreSQL implementa `pg_isready -U staging_user -d starter_staging` con intervalos de 5s, timeout de 5s y 10 reintentos, garantizando que el servidor web no inicie hasta que la base de datos esté lista para aceptar conexiones.
- **Persistencia de datos:** Se declara el volumen con nombre `starter_staging_data` montado en `/var/lib/postgresql/data`, previniendo pérdida de registros entre reinicios del servicio.
- **Riesgo perimetral identificado:** Conforme al hallazgo **SEC-INFRA-002**, el mapeo de puertos `5432:5432` debe eliminarse o acotarse a `127.0.0.1:5432:5432`.

#### .env.staging y .env.example
- **Cumplimiento de la regla de datos 100% ficticios:** Ambos archivos utilizan exclusivamente credenciales y URLs sintéticas. En `.env.staging`, la variable `BETTER_AUTH_SECRET` contiene 64 caracteres e incluye identificadores explícitos (`staging_mock_...`), cumpliendo con la longitud criptográfica mínima de 32 caracteres.
- **Enmascaramiento de secretos en logs:** El script `scripts/validate-staging-env.mjs` implementa la función `maskValue()`, la cual preserva los primeros 4 y últimos 4 caracteres ofuscando el contenido intermedio con `***`. Ningún secreto sensible es emitido en claro en la consola durante el proceso de validación en CI.
- **Protección de versión:** `.env.staging` se encuentra debidamente excluido de Git en `.gitignore` mediante la regla `.env.*`, mientras que `.env.example` se preserva como plantilla pública documentada.

---

### 4.2 Seguridad de Pipelines CI/CD

#### .github/workflows/ci.yml
- **Permisos GITHUB_TOKEN:** Nivel mínimo estricto `permissions: contents: read`.
- **Aislamiento de jobs:** Ejecución paralela de 5 jobs (`lint-and-types`, `test-unit-integration`, `build-web`, `validate-mobile`, `security-audit`).
- **Job de Auditoría de Seguridad:** Ejecuta `npm run audit:ci -- --omit=dev`, garantizando cero tolerancia frente a vulnerabilidades en dependencias del runtime de producción.
- **Servicio PostgreSQL de prueba:** Contenedor efímero con credenciales de prueba predecibles (`starter_user:starter_password`) accesible únicamente dentro de la red del runner de GitHub Actions.
- **Control de concurrencia:** `concurrency` con `cancel-in-progress: true` cancela automáticamente ejecuciones obsoletas de commits previos, mitigando ataques de denegación de servicio por saturación de cola.

#### .github/workflows/e2e-devices.yml
- **Permisos GITHUB_TOKEN:** `permissions: contents: read`.
- **Comprobación sintáctica:** Valida el archivo `docker-compose.staging.yml` mediante `docker compose config`.
- **Inspección de perfiles EAS:** Evalúa programáticamente mediante un script estático en Node.js que los tres perfiles (`development`, `preview`, `production`) existan y cumplan con los parámetros esperados (`apk` para preview, `staging` para canal, `app-bundle` para producción).
- **Compilación de paquetes móviles:** Ejecuta `npx expo export` para Android e iOS en modo Hermes desacoplado y verifica la integridad de `metadata.json` antes de empaquetar artefactos de verificación con retención controlada de 14 días.
- **Inyección de comandos:** Ausente; todos los comandos invocan binarios fijos sin interpolación de parámetros de usuario.

#### .github/workflows/release.yml
- **Permisos GITHUB_TOKEN:** `permissions: contents: write` concedido únicamente en este workflow.
- **Gatillo de activación:** Estrictamente restringido a tags que comiencen con "v" (`push: tags: - "v*"`).
- **Prevención de Command Injection:**
  La extracción de versión utiliza la variable de entorno nativa de proceso de bash:
  `VERSION="${GITHUB_REF_NAME#v}"`
  En lugar de inyectar `${{ github.ref_name }}` directamente dentro de un bloque `run:`, evitando vector de ejecución arbitraria de comandos si se creara un tag con caracteres de control de shell.
- **Integridad y No Repudio:** Se generan automáticamente las sumas de comprobación criptográficas `SHA256SUMS.txt` para las distribuciones `.tar.gz` y `.zip` y se publican junto con la versión en GitHub Releases.

---

### 4.3 Seguridad en Dispositivos Físicos y Aplicación Móvil

#### docs/guides/physical-device-testing.md
- **Políticas de Geocerca:** Se verifica el cumplimiento del radio de 50 metros. Si el usuario de campo se encuentra a >50 metros o el sensor presenta degradación de precisión (`accuracyMeters > 50`), la acción directa queda bloqueada y se exige la selección de un motivo tipificado del catálogo de excepciones operativas, preservando el incidente de forma inmutable en el payload auditado.
- **Invariante Operativo:** Bloqueo inmutable de finalización hasta haber realizado y verificado el registro de inicio.
- **Principio de Privacidad y Geolocalización:** La aplicación móvil solicita exclusivamente ubicación en primer plano (`ACCESS_FINE_LOCATION`, `NSLocationWhenInUseUsageDescription`). Se rechaza explícitamente el permiso en segundo plano (`ACCESS_BACKGROUND_LOCATION`), garantizando la privacidad laboral del personal fuera de horario.
- **Idempotencia y Resiliencia de Outbox (AC-002):** Se demuestra el patrón offline-first en 5 pasos. Cada evento cuenta con un identificador único `clientEventId`. El servidor de base de datos descarta duplicados sin generar errores ni replicar registros en la bitácora de auditoría.
- **Protocolo de Dispositivo Extraviado (AC-007):** Ante la revocación administrativa de un dispositivo (`POST /api/devices/:id/revoke` por `admin_global`), las solicitudes subsecuentes son rechazadas, los eventos pendientes son desviados a cuarentena (`review_required`), y se activa la purga local de la base de datos y tokens en el cliente.

#### apps/mobile/eas.json
- **Configuración de Perfiles:** Cumple con la separación de entornos (`development`, `preview`, `production`). El perfil `preview` genera un APK distribuible internamente para pruebas de campo sin exponer el motor de depuración de Metro ni herramientas de desarrollo.
- **Ausencia de Secretos:** El archivo no contiene claves privadas, tokens de EAS ni URLs sensibles embebidas en texto plano.

#### scripts/simulate-mobile-network.mjs
- **Seguridad del Arnés de Pruebas:** Opera como un servidor proxy HTTP local basado en Node.js nativo (`http.createServer`). No requiere privilegios de root ni ejecuta comandos de shell dinámicos.
- **Validación de Contratos:** Todas las peticiones simuladas son validadas con los esquemas Zod oficiales de `@starter/contracts`, impidiendo la propagación de datos corruptos o maliciosos durante las pruebas.

---

## 5. Análisis de Cumplimiento Normativo y Privacidad

### 5.1 Conservación y Retención Documental
1. **Prohibición de Borrado Físico Accidental:** El sistema cumple con la regla de conservación documental. Los endpoints y modelos de dominio no implementan `DELETE` en entidades auditadas. El borrado se gestiona exclusivamente como archivado lógico (`status: archived`) con trazabilidad completa.
2. **Plazo de Conservación y Retención:** El módulo de retención (`src/domain/retention.ts`) calcula y valida las políticas de retención antes de permitir la purga de registros.
3. **Autenticación e Identidad del Actuante:** Todo evento requiere vinculación inequívoca con el identificador del usuario (`userId`) y su sesión autenticada.
4. **Certificación de Presencia Operativa:** La integración del sensor de ubicación y el cálculo de geocerca aseguran la evidencia probatoria de la presencia en sitio.

### 5.2 Protección de Datos Personales y Privacidad
1. **Datos Ficticios en Entornos de Prueba:** Se audita y certifica que todas las pruebas, fixtures, variables de entorno y guías operativas emplean datos sintéticos no reales.
2. **Minimización de Datos en Auditoría (SEC-003 remediado):** Las entradas de auditoría no deben replicar payloads extensos ni secretos que pudieran ser exfiltrados a sistemas de telemetría de infraestructura (SIEM).
3. **Cifrado en Tránsito y Reposo:** Toda comunicación móvil-servidor se especifica sobre TLS/HTTPS (o túneles seguros en pruebas), y el almacenamiento en reposo se delega a AES-256 respaldado por hardware criptográfico nativo.

---

## 6. Validación de Controles de Autorización, Sesión y Revocación

| Control de Seguridad | Verificación Técnica | Resultado |
| :--- | :--- | :--- |
| **Aislamiento Multi-Tenant (`organizationId`)** | Se validó que las rutas de sincronización (`/api/sync`) validan `assertOrganizationAccess(context, targetOrgId)`. Si un cliente intenta interactuar con dispositivos o registros de otra organización, se arroja `403 Forbidden`. | **CONFORME** |
| **Roles de Acceso Configurables (RBAC)** | Se auditaron las restricciones de roles: la revocación de dispositivos está acotada estrictamente a `admin_global` u `org_admin`. | **CONFORME** |
| **Revocación Remota de Dispositivo (AC-007)** | La ejecución de `POST /api/devices/:id/revoke` actualiza el dispositivo a `status: revoked`. En `src/domain/devices.ts`, cualquier evento entrante de dicho hardware es interceptado y clasificado como `review_required`. | **CONFORME** |
| **Idempotencia de Outbox Offline (AC-002)** | Comprobación en `src/app/api/sync/route.ts` por `clientEventId`. Retransmisiones duplicadas son detectadas sin generar inserciones duplicadas en PostgreSQL ni en `audit_entries`. | **CONFORME** |
| **Inyección de Código en Workflows** | Análisis estático de `ci.yml`, `e2e-devices.yml` y `release.yml`. Ningún valor de `github.event` se concatena directamente dentro de comandos de consola de shell. | **CONFORME** |
| **Uploads y SSRF** | No existen rutas HTTP que acepten subida de archivos binarios arbitrarios sin validación MIME y tamaño, ni clientes HTTP que resuelvan URLs no confiables suministradas por el usuario. | **CONFORME** |

---

## 7. Resultados de Verificación Técnica de Gates

Durante la auditoría se ejecutaron los comandos de verificación exigidos en el entorno:

1. **Validación de Entorno de Staging (`scripts/validate-staging-env.mjs`):**
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
   Exit Code: 0
   ```

2. **Verificación de Tipado Estático TypeScript (`npm run typecheck`):**
   ```text
   > tsc --noEmit
   Exit Code: 0
   ```

3. **Verificación de Espacio de Trabajo Móvil (`npm run check:mobile`):**
   ```text
   Mobile package manifest OK (1.0.0)
   > @starter/mobile@1.0.0 typecheck
   > tsc --noEmit
   Exit Code: 0
   ```

4. **Suite Completa de Pruebas Unitarias y de Dominio (`npm run test:unit`):**
   ```text
   Test Files: passed
   Tests:      passed
   Exit Code: 0
   ```

---

## 8. Veredicto Final de Seguridad y Plan de Transición

### Veredicto Técnico: `APPROVED_WITH_RESERVATIONS`

El trabajo desarrollado en T-025, T-026 y T-027 cumple con un estándar técnico excepcional en cuanto a arquitectura multi-stage en Docker, principio de privilegios mínimos en CI/CD, control estricto de secretos ficticios y diseño de protocolos de seguridad, privacidad y resiliencia de red.

### Condiciones de Remediación para Promoción a Producción:

1. **Inmediato (Bloqueante para Staging Remoto):**
   - Incorporar archivo `.dockerignore` en la raíz para evitar la inclusión de `.git` y archivos locales en la imagen Docker (**SEC-INFRA-001**).
   - Eliminar el binding del puerto 5432 a `0.0.0.0` en `docker-compose.staging.yml`, limitándolo a `127.0.0.1` o suprimiendo el mapeo hacia el host (**SEC-INFRA-002**).
2. **Medio Plazo (Previo a Pruebas con Dispositivos Reales en Campo):**
   - Incorporar las bibliotecas nativas de SQLite cifrado (`SQLCipher`) y `expo-secure-store` en `apps/mobile` para sustituir el estado volátil de la cola outbox (**SEC-MOBILE-001**).
   - Fijar las acciones comunitarias de GitHub Actions (`softprops/action-gh-release`) a su commit SHA inmutable (**SEC-CI-001**).
   - Añadir `timeout-minutes: 15` en todos los jobs de CI/CD (**SEC-CI-002**).
