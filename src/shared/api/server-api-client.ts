import { createClient } from '@generated/backend-api/.kubb/client'
import env from '@/shared/config/env'

/** API client for server code. Call it per render: `API_URL` is a runtime value. */
export function createServerApiClient() {
	return createClient({ baseURL: env.API_URL })
}
