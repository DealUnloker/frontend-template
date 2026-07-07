# Frontend Template

Next.js 16 (App Router) starter with Feature-Sliced Design, a typed OpenAPI
client, and strict tooling out of the box.

## Stack

- **Next.js 16** — App Router, React 19, React Compiler enabled
- **Feature-Sliced Design** — validated with [steiger](https://github.com/feature-sliced/steiger)
- **Hey API (OpenAPI-TS)** — typed API client + Zod schemas + React Query options generated from an OpenAPI spec
- **TanStack React Query v5** — with SSR prefetch/hydration wired up
- **Tailwind CSS v4** + **shadcn** (base-nova, Base UI primitives)
- **Biome** — lint + format (tabs, single quotes, no semicolons)
- **Lefthook** — pre-commit lint, pre-push type-check + FSD validation
- **Vitest** + **Testing Library** — colocated component tests
- **Playwright** — e2e tests in `e2e/`
- **GitHub Actions** — lint, type-check, FSD, tests, build on push/PR
- **t3-env** — validated environment variables

## Getting started

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

The template ships pointed at the public [Swagger Petstore v3](https://petstore3.swagger.io)
demo API, so it works immediately after clone.

### Connecting your own API

1. Set `API_URL` in `.env.local` to your backend base URL.
2. Adjust `SPEC_PATH` in `openapi-ts.config.ts` if your spec lives elsewhere than `${API_URL}/openapi.json`.
3. Regenerate the client: `pnpm generate-api`.
4. Replace the example `pet` slices (`src/entities/pet`, `src/features/select-pet`, `src/widgets/pet-details`, `src/pages/home`) with your own.

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Dev server |
| `pnpm build` | Production build |
| `pnpm tsc` | Type-check |
| `pnpm lint` | Biome check + auto-fix |
| `pnpm lint:ci` | Biome check only (CI) |
| `pnpm test` | Run Vitest tests |
| `pnpm test:coverage` | Run Vitest tests with coverage report |
| `pnpm test:e2e` | Run Playwright e2e tests |
| `pnpm run fsd` | Validate FSD layer boundaries |
| `pnpm generate-api` | Regenerate API client from OpenAPI spec |

## Project structure

```
app/                  — Next.js App Router routes (thin, import from src/pages)
pages/                — required stub, see pages/README.md
generated/backend-api — generated API client (do not edit)
src/
  app/       — providers
  pages/     — page compositions (SSR prefetch example: home)
  widgets/   — composite UI blocks (pet-details)
  features/  — user interactions (select-pet)
  entities/  — business entities (pet)
  shared/    — api, config, lib, ui
```

Example data flow: `app/page.tsx` → `src/pages/home` (server component,
prefetches via `createBackendApiClients()`) → `src/widgets/pet-details` (client
component, `useApiClient()` + `useQuery`) → `src/entities/pet` (query options
wrapping the generated client).

## E2E tests

Playwright specs live in `e2e/`. The web server config builds and starts the
app itself (`pnpm build-start`); locally it reuses a server already running on
:3000, and in CI it runs `pnpm start` against the build produced earlier in the
pipeline.

Note: the demo home page uses ISR (`revalidate = 60`) and prefetches the
**live** Petstore API at build time and on background revalidations, so e2e
runs need network access and can occasionally flake if the public sandbox
misbehaves (CI retries failed tests twice). Point `API_URL` at your own
backend — or mock the network in Playwright — to make them hermetic.

## Docker

```bash
docker build -t frontend-template .
docker run -p 3000:3000 -e API_URL=https://petstore3.swagger.io/api/v3 frontend-template
```

Or with Compose (reads env from `.env.local`):

```bash
docker compose up --build
```

## Requirements

- Node >= 24 (`.nvmrc`)
- pnpm 11

## License

[MIT](./LICENSE)
