# -----------------------------------------------------------------------------
# Base: Node 24 Slim
# -----------------------------------------------------------------------------
FROM node:24-slim AS base
WORKDIR /app

# -----------------------------------------------------------------------------
# Stage 1: Deps (Instalación limpia de dependencias)
# -----------------------------------------------------------------------------
FROM base AS deps
WORKDIR /app

# Copia de manifiestos y lockfile para caché eficiente de capas
COPY package.json package-lock.json ./
COPY packages/contracts/package.json ./packages/contracts/
COPY apps/mobile/package.json ./apps/mobile/

# Instalación limpia respetando package-lock
RUN npm ci

# -----------------------------------------------------------------------------
# Stage 2: Builder (Compilación con next build --webpack produciendo standalone)
# -----------------------------------------------------------------------------
FROM base AS builder
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_PRIVATE_STANDALONE=true

# Copia de código fuente y restauración de dependencias limpias de Linux
COPY . .
RUN rm -rf .next
COPY --from=deps /app/node_modules ./node_modules

# Asegurar existencia de directorio public para standalone
RUN mkdir -p public

# Compilación standalone de Next.js mediante webpack
RUN npm run build:web

# -----------------------------------------------------------------------------
# Stage 3: Runner (Usuario no privilegiado nodejs:nextjs, artefactos mínimos)
# -----------------------------------------------------------------------------
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3005
ENV HOSTNAME="0.0.0.0"

# Crear usuario y grupo no privilegiados
RUN groupadd --system --gid 1001 nodejs && \
    groupadd --system --gid 1002 nextjs && \
    useradd --system --uid 1001 -g nextjs -G nodejs nodejs && \
    useradd --system --uid 1002 -g nodejs -G nextjs nextjs

# Copia únicamente artefactos standalone y static/public
COPY --from=builder --chown=nodejs:nextjs /app/.next/standalone ./
COPY --from=builder --chown=nodejs:nextjs /app/.next/static ./.next/static
COPY --from=builder --chown=nodejs:nextjs /app/public ./public

# Ejecución bajo usuario no privilegiado
USER nodejs:nextjs

EXPOSE 3005

CMD ["node", "server.js"]
