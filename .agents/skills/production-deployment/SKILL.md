---
name: production-deployment
description: Instrucciones operativas paso a paso para desplegar en servidores Linux (AWS EC2, Hetzner, DigitalOcean) usando Docker Compose y Caddy/Nginx con SSL automático de Let's Encrypt.
---

# Procedimiento de Despliegue en Servidores Linux (Producción)

Usa esta skill para desplegar y operar la aplicación en servidores virtuales (VPS) o instancias en la nube (AWS EC2, Hetzner Cloud, DigitalOcean Droplets) utilizando contenedores Docker orquestados con Docker Compose y un proxy inverso con certificados SSL automáticos de Let's Encrypt.

---

## 1. Requisitos Previos de la Máquina Virtual

- **Sistema Operativo Recomendado:** Ubuntu 24.04 LTS o Ubuntu 22.04 LTS (x86_64 o arm64).
- **Dimensionamiento Mínimo:** 2 vCPU, 4 GB RAM, 40 GB SSD.
- **Dominio Público:** Un dominio o subdominio apuntando con un registro DNS `A` a la dirección IP pública del servidor (ej. `app.example.com -> 198.51.100.24`).

### 1.1 Preparación Inicial del Sistema Operativo

Conéctate por SSH al servidor y ejecuta:

```bash
# Actualizar paquetes
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git ufw fail2ban htop

# Configurar Firewall UFW
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp comment 'SSH'
sudo ufw allow 80/tcp comment 'HTTP Let's Encrypt'
sudo ufw allow 443/tcp comment 'HTTPS'
sudo ufw --force enable
sudo ufw status verbose
```

### 1.2 Instalación Oficial de Docker y Docker Compose v2

```bash
# Instalar Docker Engine oficial
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Aplicar grupo docker sin reiniciar sesión
newgrp docker

# Verificar instalación
docker --version
docker compose version
```

---

## 2. Preparación del Proyecto en el Servidor

```bash
# Directorio estándar de despliegue
sudo mkdir -p /opt/golden-starter
sudo chown -R $USER:$USER /opt/golden-starter
cd /opt/golden-starter

# Clonar el repositorio
git clone https://github.com/tu-usuario/mi-aplicacion.git .
git checkout main
```

### 2.1 Configuración de Variables de Entorno de Producción

Copia la plantilla y define los valores secretos reales del entorno:

```bash
cp .env.staging .env.production
chmod 600 .env.production
```

Edita `.env.production`:

```env
NODE_ENV=production
PORT=3005
HOSTNAME=0.0.0.0

# Base de datos local en contenedor
POSTGRES_DB=starter_prod
POSTGRES_USER=starter_prod_user
POSTGRES_PASSWORD=GeneraUnaClaveMuySeguraDe32Caracteres!
POSTGRES_URL=postgresql://starter_prod_user:GeneraUnaClaveMuySeguraDe32Caracteres!@db:5432/starter_prod
DATABASE_URL=postgresql://starter_prod_user:GeneraUnaClaveMuySeguraDe32Caracteres!@db:5432/starter_prod

# Autenticación y URLs públicas
BETTER_AUTH_SECRET=GeneraUnSecretoHexAleatorioConOpensslRandHex32
BETTER_AUTH_URL=https://app.example.com
NEXT_PUBLIC_API_URL=https://app.example.com
NEXT_PUBLIC_APP_NAME="Golden Starter"

# Parámetros operativos
NEXT_PUBLIC_GEOFENCE_RADIUS_METERS=50
```

> **Generación rápida de secretos seguros en consola:**
>
> ```bash
> openssl rand -hex 32
> ```

---

## 3. Configuración del Proxy Inverso con SSL Automático

Recomendamos **Caddy** como proxy inverso estándar por su gestión nativa y automatizada de certificados Let's Encrypt (renovación sin intervención, HTTP/2 y HTTP/3 nativos). Si tu organización exige Nginx, consulta la sección 3.2.

### 3.1 Opción A: Caddy (Recomendada)

Crea el archivo `Caddyfile` en la raíz del proyecto:

```caddy
{
    email admin@example.com
}

app.example.com {
    encode gzip zstd

    # Seguridad HTTP Headers
    header {
        Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
        X-Content-Type-Options "nosniff"
        X-Frame-Options "DENY"
        X-XSS-Protection "1; mode=block"
        Referrer-Policy "strict-origin-when-cross-origin"
    }

    # Proxy hacia el contenedor de Next.js
    reverse_proxy web:3005 {
        header_up Host {host}
        header_up X-Real-IP {remote_host}
        header_up X-Forwarded-For {remote_host}
        header_up X-Forwarded-Proto {scheme}
    }
}
```

### 3.2 Opción B: Nginx + Certbot (Alternativa Corporativa)

Si prefieres Nginx, utiliza `certbot` para obtener el certificado:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot certonly --standalone -d app.example.com --non-interactive --agree-tos -m admin@example.com
```

Monta los certificados generados (`/etc/letsencrypt/live/app.example.com/`) en el contenedor o reverse proxy de Nginx.

---

## 4. Orquestación con Docker Compose de Producción

Crea `docker-compose.prod.yml`:

```yaml
services:
  caddy:
    image: caddy:2-alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
      - "443:443/udp" # HTTP/3 QUIC
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
      - caddy_data:/data
      - caddy_config:/config
    depends_on:
      web:
        condition: service_healthy
    networks:
      - app-net

  web:
    build:
      context: .
      dockerfile: Dockerfile
    restart: unless-stopped
    env_file:
      - .env.production
    expose:
      - "3005"
    depends_on:
      db:
        condition: service_healthy
    healthcheck:
      test:
        [
          "CMD",
          "node",
          "-e",
          "fetch('http://localhost:3005/api/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))",
        ]
      interval: 15s
      timeout: 5s
      retries: 5
      start_period: 20s
    networks:
      - app-net

  db:
    image: postgres:16-alpine
    restart: unless-stopped
    env_file:
      - .env.production
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - pgdata_prod:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 10s
    networks:
      - app-net

volumes:
  pgdata_prod:
    name: starter_pgdata_prod
  caddy_data:
  caddy_config:

networks:
  app-net:
    name: starter_network
    driver: bridge
```

---

## 5. Procedimiento de Lanzamiento y Ejecución de Migraciones

```bash
# 1. Validar sintaxis y configuración
node scripts/validate-staging-env.mjs

# 2. Levantar la base de datos primero
docker compose -f docker-compose.prod.yml up -d db

# 3. Esperar que PostgreSQL esté saludable
docker compose -f docker-compose.prod.yml ps

# 4. Ejecutar migraciones Drizzle desde el host o contenedor
docker compose -f docker-compose.prod.yml run --rm web npm run db:migrate

# 5. Levantar el stack completo
docker compose -f docker-compose.prod.yml up -d --build

# 6. Comprobar estado y logs
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f --tail=100
```

---

## 6. Verificación de Salud Post-Despliegue

Ejecuta las pruebas de verificación externa:

```bash
# Comprobar endpoint de salud
curl -iv https://app.example.com/api/health

# Comprobar que responde con HTTP 200 y JSON válido:
# {"status":"ok","database":"connected", ...}

# Comprobar grado de SSL y cabeceras de seguridad
curl -I https://app.example.com
```

---

## 7. Procedimiento de Actualización sin Caída (Zero-Downtime Rolling Update)

Para actualizar a una nueva versión del código en el servidor:

```bash
cd /opt/golden-starter

# 1. Descargar cambios
git pull origin main

# 2. Compilar nueva imagen en segundo plano
docker compose -f docker-compose.prod.yml build web

# 3. Ejecutar migraciones pendientes de base de datos
docker compose -f docker-compose.prod.yml run --rm web npm run db:migrate

# 4. Reemplazar contenedor web de forma atómica
docker compose -f docker-compose.prod.yml up -d --no-deps web

# 5. Limpiar imágenes huérfanas
docker image prune -f
```

---

## 8. Procedimiento de Respaldo y Restauración de Base de Datos

### Respaldo Automático Diario (Cron job)

Agrega a `crontab -e`:

```bash
0 3 * * * docker exec starter_prod_db pg_dump -U starter_prod_user starter_prod | gzip > /opt/backups/db_$(date +\%F).sql.gz
```

### Restauración en Caso de Contingencia

```bash
# 1. Detener tráfico web
docker compose -f docker-compose.prod.yml stop web

# 2. Restaurar desde respaldo
gunzip -c /opt/backups/db_2026-09-20.sql.gz | docker exec -i starter_prod_db psql -U starter_prod_user starter_prod

# 3. Reanudar servicio
docker compose -f docker-compose.prod.yml start web
```

---

## 9. Límites y Políticas de Seguridad en Producción

1. **Nunca ejecutar contenedores como root:** La imagen utiliza el usuario no privilegiado `nodejs:nextjs` (UID 1001).
2. **Nunca exponer el puerto 5432 de PostgreSQL al internet público:** La base de datos debe comunicarse exclusivamente a través de la red interna de Docker (`app-net`).
3. **Rotación periódica de secretos:** Rota `BETTER_AUTH_SECRET` y contraseñas de base de datos cada 90 días utilizando el procedimiento del runbook.
