'use client'

import { use } from 'react'

import { ApiClientContext } from './api-client-provider'
import type { ApiClients } from './types'

/** Suspends the consumer until the runtime API clients are available. */
export function useApiClient<K extends keyof ApiClients>(
	name: K,
): ApiClients[K] {
	const clientsPromise = use(ApiClientContext)
	if (!clientsPromise) {
		throw new Error('useApiClient must be used within ApiClientProvider')
	}
	const clients = use(clientsPromise)
	return clients[name]
}
