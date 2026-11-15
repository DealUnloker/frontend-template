// Mockzoo's seed pets. Anyone can edit them and `POST /v1/admin/reset`
// restores them: do that first if e2e stops finding the server-rendered pet.
export const DEMO_PET_IDS = [1, 2, 3] as const

export const DEFAULT_PET_ID = DEMO_PET_IDS[0]
