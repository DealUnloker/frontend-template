import { createClient } from '@generated/backend-api/.kubb/client'
import env from '@/shared/config/env'
import type { ApiClients } from './types'

export async function createBackendApiClients(): Promise<ApiClients> {
	return {
		api: createClient({ baseURL: env.API_URL }),
	}
}
