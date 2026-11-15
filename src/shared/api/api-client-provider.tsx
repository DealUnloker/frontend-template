'use client'

import { createClient } from '@generated/backend-api/.kubb/client'
import { createContext, type ReactNode } from 'react'
import type { ApiClients } from './types'

export const ApiClientContext = createContext<Promise<ApiClients> | null>(null)

function createClients(apiUrl: string): ApiClients {
	return {
		api: createClient({ baseURL: apiUrl }),
	}
}

// Keyed by the URL promise rather than held in component state: a retry after
// a failed render hands the provider a new promise, and state would keep
// serving the rejected one until a full reload.
const clientsByUrl = new WeakMap<Promise<string>, Promise<ApiClients>>()

function getClients(apiUrl: Promise<string>): Promise<ApiClients> {
	let clients = clientsByUrl.get(apiUrl)
	if (!clients) {
		// Flight thenables support React's use(), but .then() need not return a promise.
		clients = Promise.resolve(apiUrl).then(createClients)
		clientsByUrl.set(apiUrl, clients)
	}
	return clients
}

/** Shares runtime API clients without suspending children that do not use them. */
export function ApiClientProvider({
	apiUrl,
	children,
}: {
	apiUrl: Promise<string>
	children: ReactNode
}) {
	return (
		<ApiClientContext value={getClients(apiUrl)}>
			{children}
		</ApiClientContext>
	)
}
