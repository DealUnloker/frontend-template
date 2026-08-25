// Mockzoo seeds three stable pets at ids 1-3 (Barsik/cat, Rex/dog, Kesha/bird).
// They're user-mutable like any record in the sandbox, but Mockzoo restores
// them on request: POST https://mockzoo.dealunloker.com/v1/admin/reset. User-
// created pets get ids from 1001, so they never collide with these.
//
// If `pnpm test:e2e` fails on the server-rendered pet, check these IDs first —
// `curl https://mockzoo.dealunloker.com/v1/pets/1` (or the local Docker
// container) — and hit the reset endpoint before suspecting the app. That
// guard exists precisely to make this loud instead of silent.
export const DEMO_PET_IDS = [1, 2, 3] as const

export const DEFAULT_PET_ID = DEMO_PET_IDS[0]
