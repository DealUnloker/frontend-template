import type { ReactNode } from 'react'
import { ApiClientProvider } from '@/shared/api/api-client-provider'
import env from '@/shared/config/env'
import { QueryProvider } from './query-provider'

export function AppProviders({ children }: { children: ReactNode }) {
	return (
		<ApiClientProvider apiUrl={env.API_URL}>
			<QueryProvider>{children}</QueryProvider>
		</ApiClientProvider>
	)
}
