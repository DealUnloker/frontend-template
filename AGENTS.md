# AGENTS.md

## Commands

- `pnpm verify` — `lint:ci` + `tsc` + `fsd` + `test` in one shot. Takes a few
  seconds; run it before reporting work as done.
- `pnpm lint` — Biome check **+ auto-fix (writes files)**. To check without
  writing, use `pnpm lint:ci`. `pnpm lint-unsafe` also applies unsafe fixes.
- `pnpm test` / `test:watch` / `test:coverage` — Vitest (jsdom + Testing
  Library); coverage is V8 over `src/**`
- `pnpm test:e2e` — Playwright; needs network, builds and starts the app itself
- `pnpm build` — production build; prerenders `/` against the live API
- `pnpm dev` — dev server (long-running; don't start it just to check something)
- `pnpm generate-api` — regenerate the API client from the OpenAPI spec (Hey API)

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
  through a public API; here `fsd/public-api` and `fsd/no-public-api-sidestep`
  are off and imports go straight to segment paths.
- **The `widgets/` layer is used on purpose** (`src/widgets/pet-details`).
  The official skill discourages adopting it.
- **`src/pages/` keeps its name** — it is not renamed to `src/_pages/`, and
  the root `pages/` stub stays (it holds `_document.tsx` and `404.tsx`, so the
  empty-directory build failure that motivates the rename does not apply).

### Next.js routing vs FSD

- App Router lives in root `app/` (not `src/app` — that's the FSD app layer).
- Root `pages/` is a **required stub** (`_document.tsx`, `404.tsx`): it shadows
  the FSD layer `src/pages/` so Next.js doesn't treat it as a Pages Router
  directory. Do not delete it (see `pages/README.md`).
- Route files in `app/` are thin: they import a page composition from
  `@/pages/*` (e.g. `app/page.tsx` → `HomePage`).
- Root-level route conventions live in `app/`: `not-found.tsx`, `error.tsx`,
  `global-error.tsx`, `loading.tsx`, `robots.ts`, `sitemap.ts`, `manifest.ts`;
  `metadata` is exported from `app/layout.tsx`.
- `typedRoutes` is enabled; route constants live in `src/shared/config/routes.ts`.
- Path aliases (`tsconfig.json`): `@/*` → `./src/*`, `@generated/*` →
  `./generated/*`.

## Code style (Biome)

- Tabs, indent width 4
- Single quotes, JSX single quotes
- No semicolons (trailing commas everywhere)
- Linter: plain `recommended` preset, no rule overrides (unused imports are a
  warning; a11y rules are active)
- CSS modules enabled, Tailwind directives supported

## Git hooks (Lefthook) & CI

- **pre-commit**: Biome check + auto-fix on staged files
- **pre-push**: type-check (`pnpm tsc`) + FSD validation (`pnpm run fsd`)
- **CI** (`.github/workflows/ci.yml`): lint → tsc → fsd → tests → build → e2e on push/PR

## Testing

- **Vitest** + **Testing Library** (jsdom), config in `vitest.config.ts`
  (`resolve.tsconfigPaths: true` resolves the `@/` and `@generated/` aliases).
- Tests are colocated with slices: `src/**/*.test.{ts,tsx}`
  (example: `src/entities/pet/ui/pet-card.test.tsx`).
- **Playwright** e2e tests live in `e2e/` (`*.spec.ts`), config in
  `playwright.config.ts` — its `webServer` runs `pnpm build-start` locally
  (reusing an already-running server on :3000) and `pnpm start` in CI, where
  the build step has already run. Chromium only by default.
- E2E depends on the **live** Petstore API: the build step prefetches it (ISR
  prerender), and background revalidations hit it too. Runs need network
  access and can flake if the sandbox misbehaves; CI retries twice.

## UI stack

- **shadcn** v4 (base-nova style, Base UI primitives) — components install to `src/shared/ui/`
- **Tailwind CSS v4** with OKLCh color system (CSS variables, neutral base).
  Light theme only — there is no dark mode; do not add `dark:` variants.
- **Lucide** icons (see `src/entities/pet/ui/pet-card.tsx`, `app/loading.tsx`)
- **sonner** toasts — `<Toaster />` is mounted in `app/layout.tsx`
  (`src/shared/ui/sonner.tsx`); fire with `toast(...)` (demo in
  `src/features/select-pet/ui/pet-id-select.tsx`)
- **class-variance-authority** + **clsx** + **tailwind-merge** for class composition (`cn()` in `src/shared/lib/utils.ts`)

To add a shadcn component: `pnpx shadcn@latest add <component>`

## Data fetching

- **Hey API (OpenAPI-TS)** — generates typed client, Zod schemas, and React
  Query options from the OpenAPI spec into `generated/backend-api/`. Spec URL
  is `${API_URL}/${SPEC_PATH}` (see `openapi-ts.config.ts`); `API_URL` comes
  from the validated env (`src/shared/config/env.ts`), so `.env.local` is
  required for generation. Note: the config imports env via a relative path,
  not the `@/` alias — jiti (the config loader) doesn't resolve tsconfig paths.
  Zod response validation is enabled. Note: Petstore is a public sandbox with
  user-mutable data, so some records violate the spec and fail validation —
  the demo fetches pets by ID from a known-good list
  (`src/features/select-pet/model/demo-pet-ids.ts`).
- **TanStack React Query v5** — `QueryClient` factory at `src/shared/api/query-client.ts`
  (used by both the client provider and SSR prefetch). Its query/mutation caches log
  Zod response-validation failures via `src/shared/api/log-validation-error.ts` —
  in the browser console and in the server console during SSR prefetch, where
  errors are otherwise swallowed.
- **API client context** — `ApiClientProvider` + `useApiClient()` at `src/shared/api/`;
  server components use `createBackendApiClients()` from `src/shared/api/server-api-client.ts`.
- **Entity QO pattern** — entity options wrap generated Hey API queryOptions and
  take the client as an argument (see `src/entities/pet/api/pet.options.ts`).
- **SSR prefetch** — server page compositions use `QueryClient` + `prefetchQuery` +
  `dehydrate` + `HydrationBoundary` (see `src/pages/home/ui/home-page.tsx`).
  Routes that prefetch API data must opt out of plain static prerendering in
  their `app/` route file, otherwise Next ships a frozen build-time snapshot.
  The home route uses ISR (`export const revalidate = 60` in `app/page.tsx`):
  responses come from cache instantly and regenerate in the background. Use
  `dynamic = 'force-dynamic'` instead when data must be per-request fresh —
  but note the whole page then blocks on the API (visitors see `loading.tsx`
  until it responds).

## Environment

- Validated via t3-env in `src/shared/config/env.ts` (`API_URL` required, server-only).
- `API_URL` is intentionally NOT `NEXT_PUBLIC_`: it stays swappable at container
  runtime (no build-time inlining) while still reaching the browser as a prop
  through `ApiClientProvider` (SSR prefetch on the server, direct API calls on
  the client). Do not convert it to a public env var.
- `SITE_URL` (optional, server-only, defaults to `http://localhost:3000`) —
  public origin for robots.txt/sitemap.xml. Those routes are `force-dynamic`,
  so it is read at runtime like `API_URL` (swappable per container). The Zod
  default applies at runtime, where validation runs — do not turn these routes
  static: at build time `SKIP_ENV_VALIDATION=1` (Docker) makes t3-env return
  raw `process.env` without defaults.
- `.env.local` is optional; `SKIP_ENV_VALIDATION=1` bypasses validation (used in Docker builds).

## Build & deploy

- React Compiler enabled (`reactCompiler: true`), `poweredByHeader: false`, `typedRoutes: true`
- Docker: multi-stage `Dockerfile` (standalone output via `DOCKER_BUILD=1`);
  `.env*` files are dockerignored — pass env at runtime
- Docker builds have no `API_URL`, so the ISR build snapshot of `/` contains no
  prefetched data (prefetch errors are swallowed). Self-heals at runtime: the
  client fetches on first visit, and the next background revalidation runs
  with the container's env and restores SSR data
- Node >= 24, pnpm 11

## TypeScript 7

The project stays on **TypeScript 6** on purpose. TS 7 (the Go-native port) is
installable and `tsc --noEmit`, `next build`, Vitest and Playwright all pass
under it, but two tools call JS compiler APIs the port no longer exposes:

- `@hey-api/openapi-ts` — **hard blocker**. `pnpm generate-api` dies with
  `Cannot read properties of undefined (reading 'AnyKeyword')`: it builds the
  client via the TS AST factory (`ts.SyntaxKind`). Its peer range
  (`>=5.5.3 || >=6.0.0`) admits TS 7, so the failure only shows at runtime.
- `steiger` — soft blocker. cosmiconfig loads `steiger.config.ts` through the
  TS loader and hits `typescript.findConfigFile is not a function`. Renaming
  the config to `steiger.config.mjs` sidesteps it (verified), at the cost of
  config typings.

A `pnpm.overrides` entry pinning hey-api's own TypeScript does **not** help:
`typescript` is a peerDependency there, so a `parent>child` override rewrites
the accepted range without installing a private copy, and the import fails
identically. Escaping it needs either `@hey-api/openapi-ts@next` (its
pre-release drops the TS compiler API entirely) or moving codegen into a
nested package with its own `typescript@6`.

Dependabot ignores `typescript >=7` (`.github/dependabot.yml`). Re-test with
`pnpm generate-api` before lifting that ignore — hey-api is the gate. Worth
re-checking then: `cosmiconfig@10` dropped its TypeScript dependency, so a
steiger release that bumps it removes the config-rename workaround too.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
