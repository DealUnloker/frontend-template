# Frontend Template

Next.js 16 (App Router) starter with Feature-Sliced Design, a typed OpenAPI
client, and strict tooling out of the box.

## Stack

- **Next.js 16** — App Router, React 19, Cache Components and React Compiler enabled
- **Feature-Sliced Design** — validated with [steiger](https://github.com/feature-sliced/steiger)
- **Kubb** — typed API client + Zod schemas + React Query options generated from an OpenAPI spec
- **TanStack React Query v5** — with SSR prefetch/hydration wired up
- **Tailwind CSS v4** + **shadcn** (base-nova, Base UI primitives)
- **Biome** — lint + format (tabs, single quotes, no semicolons)
- **Lefthook** — pre-commit lint, pre-push type-check + FSD validation
- **Vitest** + **Testing Library** — colocated component tests
- **Playwright** — e2e tests in `e2e/`, including an axe accessibility check
- **GitHub Actions** — lint, type-check, FSD, tests, build, e2e on push/PR
- **t3-env** — validated environment variables

## Getting started

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

The template ships pointed at [Mockzoo](https://mockzoo.dealunloker.com), a
self-hosted, stable mock pet-store API purpose-built for this template (spec
at `/v1/openapi.json`, sandbox reset via `POST /v1/admin/reset`, seed pets at
ids 1-3), so it works immediately after clone.

### Connecting your own API

1. Set `API_URL` in `.env.local` to your backend base URL.
2. Adjust `SPEC_PATH` in `kubb.config.ts` if your spec lives elsewhere than `${API_URL}/openapi.json`.
3. Regenerate the client: `pnpm generate-api`.
4. Replace the example `pet` slices (`src/entities/pet`, `src/features/select-pet`, `src/widgets/pet-details`, `src/pages/home`) with your own.

## Scripts

| Command | Description |
| --- | --- |
| `pnpm verify` | Lint + type-check + FSD + unit tests, in one command |
| `pnpm dev` | Dev server |
| `pnpm build` | Production build |
| `pnpm tsc` | Type-check |
| `pnpm lint` | Biome check + auto-fix |
| `pnpm lint:ci` | Biome check only (CI) |
| `pnpm test` | Run Vitest tests |
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
prefetches with `createServerApiClient()`) → `src/widgets/pet-details` (client
component, `useApiClient()` + `useQuery`) → `src/entities/pet` (query options
wrapping the generated client). `AppProviders` passes a promise for the
runtime `API_URL` to `ApiClientProvider`; the browser client awaits it per
request, so nothing suspends at render time and the whole page, pet included,
is in the prerendered HTML.

## E2E tests

Playwright specs live in `e2e/`. `pnpm test:e2e` builds and starts the app
itself; locally it reuses a server already running on :3000, so stop
`pnpm dev` first. The build fills the cached home page from the **live**
Mockzoo API, so runs need network access. If the JavaScript-off spec goes
red, check that the demo pets still exist: `POST /v1/admin/reset` restores
them. Point `API_URL` at your own backend to make the runs hermetic.

## Docker

```bash
docker build -t frontend-template .
docker run -p 3000:3000 -e API_URL=https://mockzoo.dealunloker.com/v1 frontend-template
```

Or with Compose (reads env from `.env.local`):

```bash
docker compose up --build
```

## AI agents

Conventions for coding agents live in [`AGENTS.md`](./AGENTS.md). `CLAUDE.md`
imports it and adds the Claude Code specifics: permissions, skills and MCP
servers.

The repo ships executable agent configuration, worth reading before you trust
the workspace: `.claude/settings.json` pre-approves the read-only checks, and
the servers in `.mcp.json` / `.codex/config.toml` run code — `next-devtools`
is a version-pinned npm package, `context7` is a remote endpoint. Opt out
with a `disabledMcpjsonServers` entry in your own settings; delete
`.agents/skills/` if you do not want the bundled skills.

`.claude/skills/*` are symlinks into `.agents/skills/`. On a Windows clone
with `core.symlinks=false` they become text files and Claude Code will not
find the skills; other agents read `.agents/skills/` directly.

## Requirements

- Node >= 26 (`.nvmrc`)
- pnpm 12

## License

[MIT](./LICENSE)
