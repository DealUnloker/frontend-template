import type { ClientInstance } from '@generated/backend-api/.kubb/client'
import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiClientProvider } from './api-client-provider'
import { useApiClient } from './use-api-client'

const API_URL = 'https://runtime.example/v1'

function ApiConsumer({
	onClient,
}: {
	onClient: (api: ClientInstance) => void
}) {
	onClient(useApiClient('api'))
	return <p>Consumer rendered</p>
}

function renderClient(apiUrl: Promise<string>) {
	const seen: ClientInstance[] = []
	const tree = (url: Promise<string>) => (
		<ApiClientProvider apiUrl={url}>
			<ApiConsumer onClient={(api) => seen.push(api)} />
		</ApiClientProvider>
	)
	const view = render(tree(apiUrl))
	return {
		client: () => seen.at(-1) as ClientInstance,
		rerender: (url: Promise<string>) => view.rerender(tree(url)),
	}
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
		renderClient(Promise.withResolvers<string>().promise)

		expect(screen.getByText('Consumer rendered')).toBeInTheDocument()
	})

	it('holds a request until the runtime URL resolves', async () => {
		const fetch = stubFetch()
		const { promise, resolve } = Promise.withResolvers<string>()
		const { client } = renderClient(promise)

		const pending = client()({ url: '/pets/1', method: 'GET' })
		await new Promise((done) => setTimeout(done))
		expect(fetch).not.toHaveBeenCalled()

		resolve(API_URL)
		await pending

		expect(fetch.mock.calls[0]?.[0].url).toBe(`${API_URL}/pets/1`)
	})

	it('does not double the slash after a base URL that ends in one', async () => {
		const fetch = stubFetch()
		const { client } = renderClient(Promise.resolve(`${API_URL}/`))

		await client()({ url: '/pets/1', method: 'GET' })

		expect(fetch.mock.calls[0]?.[0].url).toBe(`${API_URL}/pets/1`)
	})

	it('fails requests while the runtime URL is rejected and recovers with a new one', async () => {
		const fetch = stubFetch()
		const { client, rerender } = renderClient(
			Promise.reject(new Error('stream closed')),
		)

		await expect(
			client()({ url: '/pets/1', method: 'GET' }),
		).rejects.toThrow('stream closed')
		expect(fetch).not.toHaveBeenCalled()

		// What a retry does: a fresh promise from the server.
		rerender(Promise.resolve(API_URL))
		await client()({ url: '/pets/1', method: 'GET' })

		expect(fetch).toHaveBeenCalledOnce()
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
		const { client } = renderClient(apiUrl)

		await client()({ url: '/pets/1', method: 'GET' })

		expect(fetch.mock.calls[0]?.[0].url).toBe(`${API_URL}/pets/1`)
	})
})
