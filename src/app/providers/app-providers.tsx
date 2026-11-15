import { io } from 'next/cache'
import type { ReactNode } from 'react'
import { ApiClientProvider } from '@/shared/api/api-client'
import env from '@/shared/config/env'
import { QueryProvider } from './query-provider'

// `io()` moves the env read to request time; not awaiting the result here
// keeps the layout out of the wait.
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
