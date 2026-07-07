'use client'

import { use } from 'react'

import { ApiClientContext } from './api-client-provider'
import type { ApiClients } from './types'

export function useApiClient<K extends keyof ApiClients>(
	name: K,
): ApiClients[K] {
	const clients = use(ApiClientContext)
	if (!clients) {
		throw new Error('useApiClient must be used within ApiClientProvider')
	}
	return clients[name]
}
