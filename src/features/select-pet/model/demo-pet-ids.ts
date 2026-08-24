// Petstore is a public sandbox with user-mutable data, so seed IDs rot: anyone
// can delete or corrupt a record, and the API then answers 500. These return
// spec-compliant pets today. Swap freely for your own API.
//
// If `pnpm test:e2e` fails on the server-rendered pet, check these IDs first —
// `curl https://petstore3.swagger.io/api/v3/pet/<id>` — before suspecting the
// app. That guard exists precisely to make this loud instead of silent.
export const DEMO_PET_IDS = [9, 3, 10] as const

export const DEFAULT_PET_ID = DEMO_PET_IDS[0]
