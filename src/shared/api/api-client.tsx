'use client'

import {
	type ClientInstance,
	createClient,
	defaultTransport,
} from '@generated/backend-api/.kubb/client'
import { createContext, type ReactNode, use } from 'react'

const ApiClientContext = createContext<ClientInstance | null>(null)

/**
 * Shares the browser API client. The API URL is known only at request time
 * and arrives as a promise: each request waits for it, rendering never does,
 * so a component that reads cached data stays in the static shell.
 */
export function ApiClientProvider({
	apiUrl,
	children,
}: {
	apiUrl: Promise<string>
	children: ReactNode
}) {
	const client = createClient({
		transport: async (request) =>
			defaultTransport({
				...request,
				url: (await apiUrl).replace(/\/$/, '') + request.url,
			}),
	})

	return <ApiClientContext value={client}>{children}</ApiClientContext>
}

export function useApiClient() {
	const client = use(ApiClientContext)
	if (!client) {
		throw new Error('useApiClient must be used within ApiClientProvider')
	}
	return client
}
