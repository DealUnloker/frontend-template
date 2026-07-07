import type { ClientOptions } from '@generated/backend-api'
import { createClient, createConfig } from '@generated/backend-api/client'
import env from '@/shared/config/env'
import type { ApiClients } from './types'

export async function createBackendApiClients(): Promise<ApiClients> {
	return {
		api: createClient(
			createConfig<ClientOptions>({
				baseUrl: env.API_URL,
			}),
		),
	}
}
