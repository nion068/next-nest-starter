# Next + Nest starter

A reusable TypeScript monorepo: Next.js web app, NestJS/Fastify REST API, PostgreSQL/Prisma, cookie JWT auth, English/Bengali localization, and Docker Compose.

## Start locally

1. Copy `.env.example` to `.env` and replace the JWT secrets. `apps/api/.env` is a tracked relative symlink to this root file so direct Prisma commands load the same configuration.
2. `pnpm install`
3. `docker compose up -d postgres mailpit`
4. `pnpm --filter @starter/api prisma:migrate && pnpm dev`

To create the development-only login account, run `pnpm --filter @starter/api prisma:seed`. It creates `admin@example.test` with password `ChangeMe123!`; change or remove this seed before production.

Web: `http://localhost:3000`; API docs: `http://localhost:3001/docs`; mail inbox: `http://localhost:8025`.

`docker compose up --build` runs the complete containerized stack. Set real SMTP and an SMS provider adapter through environment variables before production.

Mailpit is a local fake inbox: it accepts development emails but never sends them to real addresses. Run `docker compose up -d mailpit`, then view messages at `http://localhost:8025`.

## API contract

With the API running, run `pnpm --filter @starter/api-client generate` to refresh OpenAPI types from `/docs-json`. The small `ApiClient` wrapper is intentionally the single web transport layer; TanStack Query hooks consume it rather than calling endpoints directly.
