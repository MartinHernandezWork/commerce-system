# Pulled from Amazon ECR Public's mirror of the official image, since anonymous
# docker.io pulls from a VPS can hit Docker Hub's rate limit (429).
# ---- deps: install dependencies ----
FROM public.ecr.aws/docker/library/node:22-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---- builder: generate prisma client and build the app ----
FROM public.ecr.aws/docker/library/node:22-alpine AS builder
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# ---- runner: minimal runtime image ----
FROM public.ecr.aws/docker/library/node:22-alpine AS runner
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["npm", "start"]
