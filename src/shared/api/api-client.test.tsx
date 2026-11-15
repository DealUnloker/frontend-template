import type { ClientInstance } from '@generated/backend-api/.kubb/client'
import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiClientProvider, useApiClient } from './api-client'

const API_URL = 'https://runtime.example/v1'

let client: ClientInstance

function Consumer() {
	client = useApiClient()
	return <p>Consumer rendered</p>
}

function renderConsumer(apiUrl: Promise<string>) {
	render(
		<ApiClientProvider apiUrl={apiUrl}>
			<Consumer />
		</ApiClientProvider>,
	)
}

function stubFetch() {
	const fetch = vi.fn(async (_request: Request) => Response.json({}))
	vi.stubGlobal('fetch', fetch)
	return fetch
}

afterEach(() => {
	vi.unstubAllGlobals()
})

describe('ApiClientProvider', () => {
	it('renders consumers before the runtime URL is known', () => {
		// No Suspense boundary here: a consumer that suspended would throw.
		renderConsumer(Promise.withResolvers<string>().promise)

		expect(screen.getByText('Consumer rendered')).toBeInTheDocument()
	})

	it('holds a request until the runtime URL resolves', async () => {
		const fetch = stubFetch()
		const { promise, resolve } = Promise.withResolvers<string>()
		renderConsumer(promise)

		const pending = client({ url: '/pets/1', method: 'GET' })
		await new Promise((done) => setTimeout(done))
		expect(fetch).not.toHaveBeenCalled()

		// A trailing slash must not double up with the path's leading one.
		resolve(`${API_URL}/`)
		await pending

		expect(fetch.mock.calls[0]?.[0].url).toBe(`${API_URL}/pets/1`)
	})

	it('accepts a Flight thenable without a chainable then method', async () => {
		const fetch = stubFetch()
		// React Flight transports promises as thenables, not native Promises.
		const apiUrl = {
			// biome-ignore lint/suspicious/noThenProperty: Emulate Flight's non-chainable thenable.
			then(resolve: (value: string) => void) {
				resolve(API_URL)
			},
		} as unknown as Promise<string>
		renderConsumer(apiUrl)

		await client({ url: '/pets/1', method: 'GET' })

		expect(fetch.mock.calls[0]?.[0].url).toBe(`${API_URL}/pets/1`)
	})
})
