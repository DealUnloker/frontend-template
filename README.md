# Frontend Template

Next.js 16 (App Router) starter with Feature-Sliced Design, a typed OpenAPI
client, and strict tooling out of the box.

## Stack

- **Next.js 16** — App Router, React 19, Cache Components and React Compiler enabled
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
| `pnpm verify` | Lint + type-check + FSD + unit tests, in one command |
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

Note: the demo home page caches its prefetched snapshot with `'use cache'` +
`cacheLife('minutes')` and fills it from the **live** Petstore API at build
time and on background regenerations, so e2e runs need network access and can
occasionally flake if the public sandbox misbehaves (CI retries failed tests
twice). Two of the specs assert on the server-rendered HTML, so they also go
red when a demo pet ID rots on the sandbox. Point `API_URL` at your own
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

## AI agent instructions

Project conventions for coding agents live in [`AGENTS.md`](./AGENTS.md) — the
cross-tool open standard read by Codex, Cursor, Copilot, Gemini CLI, Zed and
others. `CLAUDE.md` is a thin shim that imports it (`@AGENTS.md`), because
Claude Code reads `CLAUDE.md` and not `AGENTS.md`. Edit `AGENTS.md`, not the
shim.

Claude Code additionally picks up two committed files worth reading before you
trust this workspace:

- `.claude/settings.json` — permission rules. `.env`, `.env.local`,
  `.env.development` and `.env.production` are denied to the agent; the
  read-only checks (`verify`, `tsc`, `lint:ci`, `test`, `fsd`, `build`) are
  pre-approved; `pnpm dlx`, `pnpx`, `pnpm add`, `pnpm install` and `pnpm dev`
  always ask. Allow rules take effect only after you accept the workspace-trust
  dialog, which lists them.
- `.agents/skills/` — Agent Skills, kept in the cross-agent directory that
  Copilot, Gemini CLI, Zed, opencode and Amp read directly; `.claude/skills/*`
  symlink to them, because Claude Code scans only its own directory. Ships
  `fsd-slice` (repo-local, scaffolds an FSD slice) plus four vendored from
  upstream projects, all MIT: two from `vercel/next.js` (`next-dev-loop` and
  `next-cache-components-adoption`), `accessibility`
  from `addyosmani/web-quality-skills`, and `vitest` from `antfu/skills`. The
  vendored ones are pinned by `skills-lock.json` and refreshed with
  `npx skills update`. None declare `allowed-tools`, so they grant no tool
  access of their own; delete `.agents/skills/` if you don't want them.

  On a Windows clone with `core.symlinks=false` the link materializes as a
  plain text file and Claude Code simply won't find the skill — every other
  agent still reads the canonical copy, and nothing else breaks. Run
  `git config core.symlinks true` before cloning to get it, or copy the
  directory instead of linking.

Note that `.mcp.json` servers execute code: `next-devtools` runs
`npx -y next-devtools-mcp@latest`, fetched from npm each session, and
`context7` is a remote HTTP endpoint. To opt out without editing the repo, add
a `disabledMcpjsonServers` entry to your own settings.

## AI tooling (MCP)

`.mcp.json` ships three project-scoped MCP servers for AI assistants:

- **next-devtools** — version-matched Next.js docs (offline, from
  `node_modules`) plus live dev-server state: real routes, compilation issues,
  and errors instead of guesses. Runtime queries need `pnpm dev` running.
- **shadcn** — resolves components against this project's `components.json`
  registry, so suggestions match the installed base-nova / Base UI setup.
- **context7** — up-to-date docs for the rest of the stack; no API key.

## Requirements

- Node >= 24 (`.nvmrc`)
- pnpm 11

## License

[MIT](./LICENSE)
