FROM node:24-alpine
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY apps/web/package.json apps/web/package.json
COPY packages/api-client/package.json packages/api-client/package.json
RUN pnpm install --frozen-lockfile=false
COPY . .
RUN pnpm --filter @starter/web build
EXPOSE 3000
CMD ["pnpm", "--filter", "@starter/web", "start"]
