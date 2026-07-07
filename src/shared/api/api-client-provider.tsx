'use client'

import type { ClientOptions } from '@generated/backend-api'
import { createClient, createConfig } from '@generated/backend-api/client'
import { createContext, type ReactNode, useState } from 'react'
import type { ApiClients } from './types'

export const ApiClientContext = createContext<ApiClients | null>(null)

function createClients(apiUrl: string): ApiClients {
	return {
		api: createClient(
			createConfig<ClientOptions>({
				baseUrl: apiUrl,
			}),
		),
	}
}

export function ApiClientProvider({
	apiUrl,
	children,
}: {
	apiUrl: string
	children: ReactNode
}) {
	const [clients] = useState(() => createClients(apiUrl))
	return <ApiClientContext value={clients}>{children}</ApiClientContext>
}
