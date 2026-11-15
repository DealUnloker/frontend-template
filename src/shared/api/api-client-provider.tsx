'use client'

import {
	createClient,
	defaultTransport,
} from '@generated/backend-api/.kubb/client'
import { createContext, type ReactNode } from 'react'
import type { ApiClients } from './types'

export const ApiClientContext = createContext<ApiClients | null>(null)

// The rule the generated client applies to its own `baseURL`. A URL that is
// already absolute (a per-request `baseURL`, a request interceptor) is kept.
function joinUrl(baseURL: string, path: string) {
	if (URL.canParse(path)) {
		return path
	}
	return baseURL.endsWith('/') && path.startsWith('/')
		? baseURL + path.slice(1)
		: baseURL + path
}

// The URL is known only at request time, so the clients exist right away and
// each request waits for it. Nothing waits at render time: a component that
// reads cached data stays in the static shell instead of behind a fallback.
function createClients(apiUrl: Promise<string>): ApiClients {
	return {
		api: createClient({
			// `await` rather than `.then()`: a Flight thenable's `.then()` need
			// not return a promise. Awaiting per request also leaves a rejected
			// URL unobserved until a request actually needs it.
			transport: async (request) =>
				defaultTransport({
					...request,
					url: joinUrl(await apiUrl, request.url),
				}),
		}),
	}
}

// Keyed by the URL promise rather than held in component state: a retry after
// a failed render hands the provider a new promise, and state would keep
// serving clients bound to the rejected one until a full reload.
const clientsByUrl = new WeakMap<Promise<string>, ApiClients>()

function getClients(apiUrl: Promise<string>): ApiClients {
	let clients = clientsByUrl.get(apiUrl)
	if (!clients) {
		clients = createClients(apiUrl)
		clientsByUrl.set(apiUrl, clients)
	}
	return clients
}

/** Shares runtime API clients; their requests wait for the runtime URL. */
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
