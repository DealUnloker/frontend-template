import { io } from 'next/cache'
import type { ReactNode } from 'react'
import { ApiClientProvider } from '@/shared/api/api-client-provider'
import env from '@/shared/config/env'
import { QueryProvider } from './query-provider'

// `API_URL` must reach the browser as the value the *container* was started
// with, not the one the image was built with. Under Cache Components a plain
// read would be captured during prerendering, so a Docker image built without
// `API_URL` would serve `undefined` to every visitor until the first
// background regeneration. `io()` suspends during prerendering and resolves
// immediately on a real request, which keeps this read per-request while
// leaving the rest of the page prerenderable.
export async function AppProviders({ children }: { children: ReactNode }) {
	await io()

	return (
		<ApiClientProvider apiUrl={env.API_URL}>
			<QueryProvider>{children}</QueryProvider>
		</ApiClientProvider>
	)
}
