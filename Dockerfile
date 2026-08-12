# syntax=docker/dockerfile:1

# ---------- dependencies ----------
FROM node:20-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---------- build ----------
FROM node:20-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# Placeholder only: lib/session.ts validates SESSION_SECRET at module load, and
# `next build` evaluates route modules while prerendering. The real secret comes
# from Secret Manager at runtime.
ENV SESSION_SECRET=build-time-placeholder-not-used-at-runtime-32
RUN npm run build

# ---------- runtime ----------
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN groupadd --system --gid 1001 nodejs \
 && useradd --system --uid 1001 --gid nodejs nextjs

# The standalone bundle carries its own minimal node_modules and server.js.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
# Static assets and public files are not part of the standalone trace.
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Migrations and admin creation ship with the image so Cloud Run jobs can run
# them against this exact build:
#   node scripts/migrate.mjs
#   node scripts/create-admin.mjs you@example.com
# load-env.mjs is imported by both — omitting it breaks them at runtime.
COPY --from=builder --chown=nextjs:nodejs /app/migrations ./migrations
COPY --from=builder --chown=nextjs:nodejs /app/scripts/migrate.mjs ./scripts/migrate.mjs
COPY --from=builder --chown=nextjs:nodejs /app/scripts/create-admin.mjs ./scripts/create-admin.mjs
COPY --from=builder --chown=nextjs:nodejs /app/scripts/load-env.mjs ./scripts/load-env.mjs

USER nextjs

# Cloud Run injects PORT; this default is only for running the image locally.
ENV PORT=8080
ENV HOSTNAME=0.0.0.0
EXPOSE 8080

CMD ["node", "server.js"]
