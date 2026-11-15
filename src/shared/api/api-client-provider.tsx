'use client'

import {
	createClient,
	defaultTransport,
} from '@generated/backend-api/.kubb/client'
import { createContext, type ReactNode } from 'react'
import type { ApiClients } from './types'

export const ApiClientContext = createContext<ApiClients | null>(null)

/**
 * Shares the browser API clients. The API URL is known only at request time
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
	const clients: ApiClients = {
		api: createClient({
			transport: async (request) =>
				defaultTransport({
					...request,
					url: (await apiUrl).replace(/\/$/, '') + request.url,
				}),
		}),
	}

	return <ApiClientContext value={clients}>{children}</ApiClientContext>
}
