import { io } from 'next/cache'
import type { ReactNode } from 'react'
import { ApiClientProvider } from '@/shared/api/api-client-provider'
import env from '@/shared/config/env'
import { QueryProvider } from './query-provider'

// Defer the env read to request time without suspending the provider tree.
async function getRuntimeApiUrl() {
	await io()
	return env.API_URL
}

export function AppProviders({ children }: { children: ReactNode }) {
	return (
		<ApiClientProvider apiUrl={getRuntimeApiUrl()}>
			<QueryProvider>{children}</QueryProvider>
		</ApiClientProvider>
	)
}
