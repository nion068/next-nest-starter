FROM node:24-alpine AS base
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY apps/api/package.json apps/api/package.json
RUN pnpm install --frozen-lockfile=false
COPY . .
RUN pnpm --filter @starter/api prisma:generate && pnpm --filter @starter/api build
EXPOSE 3001
CMD ["sh", "-c", "pnpm --filter @starter/api exec prisma migrate deploy && pnpm --filter @starter/api start"]
