# AGENTS.md

## Commands

- `pnpm verify` — `lint:ci` + `tsc` + `fsd` + `test` in one shot. Takes a few
  seconds; run it before reporting work as done.
- `pnpm lint` — Biome check **+ auto-fix (writes files)**. To check without
  writing, use `pnpm lint:ci`.
- `pnpm test` — Vitest (jsdom + Testing Library)
- `pnpm test:e2e` — Playwright; needs network, builds and starts the app itself
- `pnpm build` — production build; fills the `'use cache'` snapshot of `/`
  against the live API
- `pnpm dev` — dev server (long-running; don't start it just to check something)
- `pnpm generate-api` — regenerate the API client from the OpenAPI spec (Kubb,
  into `generated/backend-api/`).

Install dependencies only with `pnpm add`. Agent Skills bundled in
`.agents/skills/` sometimes give `npm i -g` / `npx` instructions — translate
them: `pnpm-workspace.yaml` sets `minimumReleaseAge: 1440`,
CI runs `pnpm install --frozen-lockfile`, and an npm-installed dev dependency
fails the build.

## Architecture

Next.js 16 App Router with Feature-Sliced Design (FSD).

Layers live under `src/` — see the tree in `README.md`.

### FSD rules (enforced by steiger, see `steiger.config.ts`)

- Preset: `fsd.configs.recommended` with overrides:
  - `fsd/public-api: off` and `fsd/no-public-api-sidestep: off` — **no `index.ts`
    barrel files in slices**. Import directly from segment paths, e.g.
    `@/entities/pet/api/pet.options`, `@/widgets/pet-details/ui/pet-details`.
    Do not create slice `index.ts` files.
  - `fsd/insignificant-slice: warn` — a slice referenced from only one place
    is a warning, not an error (expected for the template's demo slices).
    `pnpm run fsd` prints exactly one such warning, about
    `src/widgets/pet-details`, and still exits 0. Anything else it prints is
    a real finding.
  - `fsd/segments-by-purpose: off` for `src/app/**` only — `providers` is the
    conventional app-layer segment name, but steiger-plugin >=0.7 flags it as
    essence-based. The rule stays active on all other layers.
- Layer imports go strictly downward only:
  pages → widgets → features → entities → shared. A slice must not import from
  its own layer (e.g. entity → entity) or any layer above.
- Slices are organized into segments: `ui/`, `api/`, `model/`, `lib/`, `config/`.

### FSD deviations (deliberate — these override external FSD guidance)

Published FSD material, including the official `feature-sliced/skills` Agent
Skill, teaches the opposite of the three rules below. This project's choices
win; do not "fix" the code toward the canonical guidance.

- **No slice `index.ts` barrels.** Canonical FSD makes every slice export
  through a public API.
- **The `widgets/` layer is used on purpose** (`src/widgets/pet-details`).
  The official skill discourages adopting it.
- **`src/pages/` keeps its name** — it is not renamed to `src/_pages/`; the
  root `pages/` stub (below) removes the build failure that motivates the
  rename.

### Next.js routing vs FSD

- App Router lives in root `app/` (not `src/app` — that's the FSD app layer).
- Root `pages/` is a **required stub** (`_document.tsx`, `404.tsx`): it shadows
  the FSD layer `src/pages/` so Next.js doesn't treat it as a Pages Router
  directory. Do not delete it (see `pages/README.md`).
- Route files in `app/` are thin: they import a page composition from
  `@/pages/*` (e.g. `app/page.tsx` → `HomePage`).
- Root-level route conventions live in `app/`: `not-found.tsx`, `error.tsx`,
  `global-error.tsx`, `loading.tsx`, `robots.ts`, `sitemap.ts`, `manifest.ts`,
  `icon.svg`; `metadata` and `viewport` are exported from `app/layout.tsx`.
  `app/favicon.ico` and `public/icon-{192,512}.png` (manifest icons) are
  rasters of `icon.svg`: re-render them when it changes.
- `typedRoutes` is enabled; route constants live in `src/shared/config/routes.ts`.
- Path aliases (`tsconfig.json`): `@/*` → `./src/*`, `@generated/*` →
  `./generated/*`.

## Code style (Biome)

Tabs, single quotes, no semicolons, trailing commas; plain `recommended`
linter preset with the a11y rules on (`biome.json`). `pnpm lint` formats.

## Git hooks (Lefthook) & CI

- **pre-commit**: Biome check + auto-fix on staged files
- **pre-push**: type-check (`pnpm tsc`) + FSD validation (`pnpm run fsd`)
- **CI** (`.github/workflows/ci.yml`): lint → tsc → fsd → tests → build → e2e on push/PR
- **Releases** are cut by hand with pnpm's own command, no release tooling:
  `pnpm version <patch|minor|major> -m 'Release v%s'` bumps `version` in
  `package.json`, commits and tags `v…`; then `git push --follow-tags` and
  `gh release create v… --generate-notes`. Generated notes list merged PRs
  only: describe directly pushed work with `--notes`, it is put above them.

## Testing

- **Vitest 5** + **Testing Library** (jsdom), config in `vitest.config.ts`
  (`resolve.tsconfigPaths: true` resolves the `@/` and `@generated/` aliases).
  The bundled `vitest` Agent Skill was generated from the 5.x beta, but its
  API matches 5.0 stable: `vi.when`, `toHaveBeenExhausted` and context-scoped
  `bench` exist, `test.sequential` is gone (use `{ concurrent: false }`).
  Vitest 5 also defaults `clearMocks` to `true`.
- Tests are colocated with slices: `src/**/*.test.{ts,tsx}`
  (example: `src/entities/pet/ui/pet-card.test.tsx`).
- **Playwright** e2e tests live in `e2e/` (`*.spec.ts`), config in
  `playwright.config.ts` — its `webServer` runs `pnpm build-start` locally
  (reusing an already-running server on :3000) and `pnpm start` in CI, where
  the build step has already run. Chromium only by default.
  `reuseExistingServer` is on outside CI, so **stop `pnpm dev` before
  `pnpm test:e2e`** — otherwise Playwright silently tests the dev server
  instead of a production build, and the run can go green on code that would
  fail when built.
- E2E depends on the **live** Mockzoo API: the build fills the `'use cache'`
  snapshot from it, and background regenerations hit it too. Runs need network
  access and can flake if the sandbox misbehaves; CI retries twice.
- `e2e/a11y.spec.ts` runs axe (`@axe-core/playwright`) against the rendered
  pages and fails on any violation. Add new routes to its list.
- One spec runs with JavaScript off: it fails if the pet stops being
  server-rendered or leaves the static shell. If it goes red, check the demo
  pet IDs against Mockzoo before suspecting the app: seed pets 1-3 are
  mutable, and `POST /v1/admin/reset` restores them
  (`src/features/select-pet/model/demo-pet-ids.ts`). Another spec fails if `/`
  starts re-rendering per request instead of coming from cache.

## UI stack

- **shadcn** v4 (base-nova style, Base UI primitives) — components install to `src/shared/ui/`
- **Tailwind CSS v4** with OKLCh color system (CSS variables, neutral base).
  Light theme only — there is no dark mode; do not add `dark:` variants.
- **Lucide** icons (see `src/entities/pet/ui/pet-card.tsx`, `app/loading.tsx`)
- **class-variance-authority** + shadcn's **cn** package (it replaces clsx and
  tailwind-merge) for class composition. `src/shared/lib/utils.ts` re-exports
  `cn()`, because shadcn components import it from there.

To add a shadcn component: `pnpx shadcn@latest add <component>`

## Data fetching

- **Kubb v5** generates types, Zod schemas, a fetch client and React Query
  options from the OpenAPI spec into `generated/backend-api/`
  (`pnpm generate-api`, config in `kubb.config.ts`). It reads the spec from
  `${API_URL}/openapi.json`, so it needs `API_URL` in the environment or in
  `.env.local`. The config imports env by relative path: jiti does not resolve
  tsconfig aliases. Three settings are load-bearing:
  - `integerType: 'number'` — int64 otherwise becomes `bigint`, which query
    keys and JSON cannot carry;
  - `hooks: true` — without it the output has an unused `*QueryKey` type and
    fails `noUnusedLocals`. The generated `use*` hooks themselves are not
    used: go through entity options;
  - the telemetry opt-out at the top — the CLI otherwise reports plugin names
    and options to `otlp.kubb.dev`.
- **Response validation** is on (`validator: { response: 'zod' }`): a mismatch
  throws `ParseError`, a well-formed non-2xx throws `ResponseError`. The query
  cache in `src/shared/api/query-client.ts` logs `ParseError` issues, in the
  browser and during the server prefetch. Mutations are not covered: add a
  `MutationCache` with the same handler along with the first mutation.
- **Retries** (same file): in the browser a failed query is retried twice,
  except a 4xx response or a `ParseError`: those fail at once, since a retry
  would get the same answer. The server prefetch never retries.
- **`QueryProvider`** keeps its client in `useState`, so whatever suspends
  needs a Suspense boundary below the provider (`app/loading.tsx` covers
  pages); without one React discards the client on the initial render.
- **API client** (`src/shared/api/`). Server code calls
  `createServerApiClient()`. Client components call `useApiClient()`:
  `ApiClientProvider` builds that client at once and its transport awaits the
  runtime URL promise per request, so the hook never suspends. That client
  has no `baseURL`: `getUrl()` returns a path, and a per-request `baseURL` is
  not supported. `await` the URL promise, never chain on it: a React Flight
  thenable's `.then()` does not return a promise. Do not use or configure the
  default `client` exported by `.kubb/client`.
- **Entity query options** wrap the generated ones and take the client as an
  argument (`src/entities/pet/api/pet.options.ts`).
- **SSR prefetch**: a server composition creates a `QueryClient`, awaits
  `query(...).catch(noop)` and renders `HydrationBoundary` with `dehydrate()`
  (`src/pages/home/ui/home-page.tsx`). `prefetchQuery` is deprecated in
  TanStack Query v5; `query()` throws, hence the `catch`.
- **`staleTime` is `'static'` on the server.** A numeric one makes `useQuery`
  read the clock during render; Cache Components treats that as request-time
  data and moves the component, with its nearest Suspense boundary, out of
  the static shell (under `app/loading.tsx` that is the whole page). A query
  with its own numeric `staleTime` brings this back: give that component its
  own `<Suspense>`.
- **Caching is opt-in.** Cache Components is on: everything is dynamic by
  default, and `export const revalidate` / `dynamic` / `fetchCache` are build
  errors. A composition that prefetches marks itself `'use cache'` +
  `cacheLife(...)`; `HomePage` uses `cacheLife('minutes')` (stale 5m,
  revalidate 60s, expire 1h). The directive cannot move deeper: `'use cache'`
  takes only serializable arguments and results, and `QueryClient` and the
  API client are neither.
- **Runtime values** need `await io()` (`next/cache`) or, in a route handler,
  `await connection()` (`next/server`); otherwise they are captured at build
  time. `AppProviders` starts `getRuntimeApiUrl()` and passes the promise on
  without awaiting it, so nothing on the page waits for it at render time
  and `HomePage` needs no Suspense. Do not wrap such content in a boundary
  "just in case": once a fallback has painted, React holds the reveal of
  streamed content for 300 ms, and every reload flashes it.

## Environment

- Validated by t3-env in `src/shared/config/env.ts`. `.env.local` is optional;
  `SKIP_ENV_VALIDATION=1` skips validation (Docker builds).
- `API_URL` (required, server-only) is deliberately not `NEXT_PUBLIC_`: it
  stays swappable per container and reaches the browser as a promise prop.
- `SITE_URL` (optional, defaults to `http://localhost:3000`) is the public
  origin for robots.txt and sitemap.xml. Those routes call `connection()`, so
  it is read at runtime too. Do not make them static: with validation skipped
  at build time the default is not applied.

## Build & deploy

- `next.config.ts`: Cache Components, partial prefetching, React Compiler,
  typed routes, security headers; standalone output when `DOCKER_BUILD=1`.
  The compiler is the Rust port (`experimental.turbopackRustReactCompiler`),
  so there is no Babel plugin. Vitest does not run it: unit tests render
  uncompiled components, e2e covers the compiled build.
- Docker: multi-stage `Dockerfile`; `.env*` files are dockerignored — pass env
  at runtime. Its `HEALTHCHECK` polls `app/api/health/route.ts`.
- Pins: Docker images by tag and digest, GitHub Actions by commit SHA;
  Dependabot bumps both. `next-devtools-mcp` is pinned by hand in `.mcp.json`
  and `.codex/config.toml`.
- The image is built without `API_URL`, so the prefetch fails and the cached
  snapshot of `/` holds no data. The page still works: the shell contains the
  heading, the pet ID buttons and the card skeleton, the browser fetches from
  the container's `API_URL`, and the first regeneration after 60 s brings the
  server-rendered data back (checked by building without `API_URL` and
  starting that build with one).
- Query keys hold the path template and params, not the backend URL. A build
  that did prefetch and then runs against another backend hydrates the build
  backend's data until the first regeneration (not exercised).
- `cacheLife('minutes')` expires after an hour: with no traffic for that long
  the next visitor waits on the API instead of getting a stale snapshot.
- Node >= 26, pnpm 12. The pnpm version is pinned twice: `packageManager` in
  `package.json` and the `pnpm` stage of the `Dockerfile`.

## TypeScript 7

The project is on **TypeScript 7** (the Go-native port). `tsc --noEmit`,
`next build` (it runs the project's `tsc` CLI), steiger, Vitest and
Playwright all work under it with no config changes.

Kubb has no dependency on the TypeScript compiler API: its stock plugins
print code directly. All `kubb` / `@kubb/*` packages are pinned exactly
because CI does not run codegen. After bumping them, run `pnpm generate-api`
and review the diff in `generated/`.

`steiger` 0.7+ loads `steiger.config.ts` under TS 7 (cosmiconfig 10 dropped
its TypeScript dependency). `pnpm-workspace.yaml` still widens the
`tsconfck>typescript` peer range: `tsconfck` (via the steiger plugin) asks for
`^5` and pnpm reports an unmet peer without it.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
