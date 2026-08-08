# next-nest-starter

A reusable TypeScript monorepo: Next.js web app, NestJS/Fastify REST API, PostgreSQL/Prisma, cookie JWT auth, English/Bengali localization, and Docker Compose.

## Initialize a project

After creating a repository from this template, run `pnpm init:project` and enter a lowercase project name such as `abashx`. It updates the workspace package scope, Docker and CI package filters, telemetry service/namespace, SigNoz deployment name, and this README. It derives `@abashx` and `abashx-api` automatically. To use it in a non-interactive setup, run `pnpm init:project abashx`.

## Start locally

1. Run `pnpm init:project` if this repository was created from the template.
2. Copy `.env.example` to `.env` and replace the JWT secrets. `apps/api/.env` is a tracked relative symlink to this root file so direct Prisma commands load the same configuration.
3. `pnpm install`
4. `docker compose up -d postgres mailpit`
5. `pnpm --filter @starter/api prisma:migrate && pnpm dev`

To create the development-only login account, run `pnpm --filter @starter/api prisma:seed`. It creates `admin@example.test` with password `ChangeMe123!` and phone `+8801712345678`; change or remove this seed before production. In development, the SMS code is written to the API terminal by the console SMS provider.

Web: `http://localhost:3000`; API docs: `http://localhost:3001/docs`; mail inbox: `http://localhost:8025`.

`docker compose up --build` runs the complete containerized stack. Set real SMTP and an SMS provider adapter through environment variables before production.

Mailpit is a local fake inbox: it accepts development emails but never sends them to real addresses. Run `docker compose up -d mailpit`, then view messages at `http://localhost:8025`.

## Observability with SigNoz

The API emits OpenTelemetry traces and metrics when OTEL_EXPORTER_OTLP_ENDPOINT is set. It is configured for local SigNoz in .env.example; remove or leave it unset to disable telemetry.

Install the supported SigNoz deployment CLI, then start the self-hosted local stack:

    curl -fsSL https://signoz.io/foundry.sh | bash
    pnpm observability:up

Open SigNoz at http://localhost:8080. It receives OTLP over HTTP at http://localhost:4318. If the API runs in Docker Compose, set OTEL_EXPORTER_OTLP_ENDPOINT to http://host.docker.internal:4318, or use the appropriate host gateway.

To validate telemetry with automatic HTTP tracing, start PostgreSQL, run pnpm --filter @starter/api build, then run pnpm --filter @starter/api start and open http://localhost:3001/api/v1/health several times. In SigNoz, select Services, then starter-api, and inspect traces and metrics. The API uses automatic HTTP, Fastify, Prisma/PostgreSQL, and outbound HTTP instrumentation. Never attach credentials, cookies, verification codes, JWTs, or raw customer contact details as telemetry attributes.

## API contract

With the API running, run `pnpm --filter @starter/api-client generate` to refresh OpenAPI types from `/docs-json`. The small `ApiClient` wrapper is intentionally the single web transport layer; TanStack Query hooks consume it rather than calling endpoints directly.
