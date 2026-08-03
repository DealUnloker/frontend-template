# CLAUDE.md

## Commands

- `pnpm dev` — start dev server
- `pnpm build` — production build
- `pnpm tsc` — type-check (no emit)
- `pnpm lint` — Biome check + auto-fix
- `pnpm lint-unsafe` — Biome check + unsafe auto-fix
- `pnpm lint:ci` — Biome check only (no writes, used in CI)
- `pnpm test` / `pnpm test:watch` — Vitest (jsdom + Testing Library)
- `pnpm test:coverage` — Vitest with V8 coverage (`src/**`)
- `pnpm test:e2e` — Playwright e2e (builds and starts the app itself)
- `pnpm run fsd` — validate FSD architecture via steiger
- `pnpm generate-api` — regenerate API client from OpenAPI spec (Hey API)

## Architecture

Next.js 16 App Router with Feature-Sliced Design (FSD).

### FSD layers (`src/`)

```
src/
  app/        — providers (app-providers.tsx wires them together)
  pages/      — page compositions (home — SSR prefetch example)
  widgets/    — composite UI blocks (pet-details)
  features/   — user interactions (select-pet)
  entities/   — business entities (pet — QO pattern example)
  shared/     — api client, config, lib (cn()), ui (shadcn components)
```

### FSD rules (enforced by steiger, see `steiger.config.ts`)

- Preset: `fsd.configs.recommended` with overrides:
  - `fsd/public-api: off` and `fsd/no-public-api-sidestep: off` — **no `index.ts`
    barrel files in slices**. Import directly from segment paths, e.g.
    `@/entities/pet/api/pet.options`, `@/widgets/pet-details/ui/pet-details`.
    Do not create slice `index.ts` files.
  - `fsd/insignificant-slice: warn` — a slice referenced from only one place
    is a warning, not an error (expected for template examples).
  - `fsd/segments-by-purpose: off` for `src/app/**` only — `providers` is the
    conventional app-layer segment name, but steiger-plugin >=0.7 flags it as
    essence-based. The rule stays active on all other layers.
- Layer imports go strictly downward only:
  pages → widgets → features → entities → shared. A slice must not import from
  its own layer (e.g. entity → entity) or any layer above.
- Slices are organized into segments: `ui/`, `api/`, `model/`, `lib/`, `config/`.

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

### Path aliases

- `@/*` maps to `./src/*`
- `@generated/*` maps to `./generated/*`

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

## Providers

`AppProviders` at `src/app/providers/app-providers.tsx` wraps the app with:
1. `ApiClientProvider`
2. `QueryProvider`

## Build & deploy

- React Compiler enabled (`reactCompiler: true`), `poweredByHeader: false`, `typedRoutes: true`
- Docker: multi-stage `Dockerfile` (standalone output via `DOCKER_BUILD=1`);
  `.env*` files are dockerignored — pass env at runtime
- Docker builds have no `API_URL`, so the ISR build snapshot of `/` contains no
  prefetched data (prefetch errors are swallowed). Self-heals at runtime: the
  client fetches on first visit, and the next background revalidation runs
  with the container's env and restores SSR data
- Node >= 24, pnpm 11
