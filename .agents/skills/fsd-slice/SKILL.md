---
name: fsd-slice
description: Creates or extends a Feature-Sliced Design slice in this repo's src/ tree with the correct layer, segments and import paths. Use when adding a new entity, feature, widget, page or shared module, when creating or moving files under src/entities, src/features, src/widgets, src/pages or src/shared, when deciding which FSD layer something belongs in, or when `pnpm run fsd` reports a layer violation. Covers this project's deliberate deviations from published FSD guidance - no index.ts barrel files, the widgets layer is used on purpose, src/pages keeps its name - plus the entity query-options pattern that takes the API client as an argument.
---

# Adding an FSD slice

## 1. Pick the layer

Work top-down: the highest layer that fits is usually wrong. Ask what the code
knows about.

| Layer | Holds | Knows about |
| --- | --- | --- |
| `shared` | Reusable code with no business meaning: UI kit, API client, `cn()`, env, routes | Nothing project-specific |
| `entities` | A business entity: its type, its query options, its card | One entity |
| `features` | One user interaction: selecting, filtering, submitting | The entities it acts on |
| `widgets` | A composite UI block assembled from features and entities | Several slices |
| `pages` | A page composition, including SSR prefetch | Everything below |

Imports go strictly downward. A slice must not import from its own layer
(entity → entity is a violation) or from any layer above it.

## 2. Create the segments

Segments are named by purpose, never by essence — `ui`, `api`, `model`, `lib`,
`config`. Never `components`, `hooks`, `utils`, `types`.

```bash
mkdir -p src/entities/<slice>/{api,model,ui}
```

Create only the segments you need. Files are kebab-case; tests sit next to what
they test (`pet-card.tsx` → `pet-card.test.tsx`).

Reference slice: `src/entities/pet` (api + model + ui + colocated test).

## 3. Import directly from segments — never create a barrel

This repo turns off `fsd/public-api` and `fsd/no-public-api-sidestep`. Published
FSD guidance says the opposite; here it does not apply.

```ts
// Correct — import the exact module
import { petQueries } from '@/entities/pet/api/pet.options'
import { PetCard } from '@/entities/pet/ui/pet-card'

// Wrong — do not create src/entities/pet/index.ts and import through it
import { petQueries, PetCard } from '@/entities/pet'
```

Two more deviations to preserve: the `widgets/` layer **is** used here
(`src/widgets/pet-details`), and `src/pages/` keeps its name — it is not
renamed to `src/_pages/`. The root `pages/` directory is a required Next.js
stub; do not delete it.

## 4. Entity data access: the query-options pattern

Entity options wrap the generated Hey API `queryOptions` and take the client as
an argument, so the same options work on the server and in the browser.

```ts
// src/entities/<slice>/api/<slice>.options.ts
import { getThingByIdOptions } from '@generated/backend-api/@tanstack/react-query.gen'
import type { Client } from '@generated/backend-api/client'

export const thingQueries = {
	byId: (client: Client, id: number) =>
		getThingByIdOptions({ client, path: { id } }),
}
```

Consumers get the client from `useApiClient('api')` in client components, or
`createBackendApiClients()` in server components. Never import the generated
client directly into a component.

## 5. Wire it into a route

Route files under `app/` stay thin — they import a composition from `@/pages/*`
and nothing else. Route constants belong in `src/shared/config/routes.ts`
(`typedRoutes` is on).

Cache Components is on (`cacheComponents: true` in `next.config.ts`), so
`export const revalidate`, `export const dynamic` and `export const fetchCache`
are **hard build errors**. Never add them to a route.

Caching is opt-in, not opt-out — everything is uncached by default:

- **A page composition that prefetches API data** — put the cache boundary on
  the composition itself, next to the prefetch, as in
  `src/pages/home/ui/home-page.tsx`:

  ```tsx
  import { cacheLife } from 'next/cache'

  export async function ThingPage() {
  	'use cache'
  	cacheLife('minutes') // stale 5m / revalidate 60s / expire 1h
  	// ...prefetch + <HydrationBoundary>
  }
  ```

  The directive has to sit here and not deeper: `'use cache'` only accepts
  serializable arguments and return values, and `QueryClient` and the Hey API
  client are neither. Without it the route still works — `app/loading.tsx` is
  the Suspense boundary that keeps it from blocking the prerender — it is just
  refetched on every request.

- **Anything that must read env (or other runtime state) per request** —
  `await io()` from `next/cache` as the first statement, and make the function
  `async`. See `src/app/providers/app-providers.tsx`. For route handlers that
  should wait for a real request, `await connection()` from `next/server` does
  the same and is what `app/robots.ts` and `app/sitemap.ts` use. Skip this and
  the build-time value gets baked into the prerendered output.

## 6. Match the house style

Tabs, indent width 4, single quotes including JSX, no semicolons, trailing
commas. Light theme only — never add `dark:` variants.

## 7. Verify

```bash
pnpm verify
```

`pnpm run fsd` prints exactly one expected warning, about
`src/widgets/pet-details` being referenced from a single place. Anything else
it reports is a real violation — fix the import direction rather than relaxing
`steiger.config.ts`.
