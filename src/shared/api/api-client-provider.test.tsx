import { act, render, screen } from '@testing-library/react'
import { Component, type ReactNode, Suspense } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { ApiClientProvider } from './api-client-provider'
import { useApiClient } from './use-api-client'

function ApiConsumer() {
	const api = useApiClient('api')
	return <p>{api.getConfig().baseURL}</p>
}

class ErrorBoundary extends Component<
	{ children: ReactNode },
	{ failed: boolean }
> {
	override state = { failed: false }

	static getDerivedStateFromError() {
		return { failed: true }
	}

	override render() {
		return this.state.failed ? <p>Failed</p> : this.props.children
	}
}

describe('ApiClientProvider', () => {
	it('renders the shell while only API consumers await the runtime URL', async () => {
		const { promise, resolve } = Promise.withResolvers<string>()

		await act(async () =>
			render(
				<ApiClientProvider apiUrl={promise}>
					<h1>Static shell</h1>
					<Suspense fallback={<p>Fetching details</p>}>
						<ApiConsumer />
					</Suspense>
				</ApiClientProvider>,
			),
		)

		expect(screen.getByRole('heading')).toHaveTextContent('Static shell')
		expect(screen.getByText('Fetching details')).toBeInTheDocument()

		await act(async () => {
			resolve('https://runtime.example/v1')
		})

		expect(
			screen.getByText('https://runtime.example/v1'),
		).toBeInTheDocument()
		expect(screen.queryByText('Fetching details')).not.toBeInTheDocument()
	})

	it('recovers when a rejected runtime URL is replaced', async () => {
		const consoleError = vi
			.spyOn(console, 'error')
			.mockImplementation(() => {})
		const tree = (apiUrl: Promise<string>, attempt: number) => (
			<ApiClientProvider apiUrl={apiUrl}>
				<ErrorBoundary key={attempt}>
					<Suspense fallback={<p>Fetching details</p>}>
						<ApiConsumer />
					</Suspense>
				</ErrorBoundary>
			</ApiClientProvider>
		)

		const view = await act(async () =>
			render(tree(Promise.reject(new Error('stream closed')), 1)),
		)
		expect(screen.getByText('Failed')).toBeInTheDocument()

		// What an error-boundary retry does: a fresh promise from the server.
		await act(async () =>
			view.rerender(
				tree(Promise.resolve('https://runtime.example/v1'), 2),
			),
		)
		expect(
			screen.getByText('https://runtime.example/v1'),
		).toBeInTheDocument()

		consoleError.mockRestore()
	})

	it('accepts a Flight thenable without a chainable then method', async () => {
		// React Flight transports promises as thenables, not native Promises.
		const apiUrl = {
			// biome-ignore lint/suspicious/noThenProperty: Emulate Flight's non-chainable thenable.
			then(resolve: (value: string) => void) {
				resolve('https://runtime.example/v1')
			},
		} as unknown as Promise<string>

		await act(async () => {
			render(
				<ApiClientProvider apiUrl={apiUrl}>
					<Suspense fallback={<p>Fetching details</p>}>
						<ApiConsumer />
					</Suspense>
				</ApiClientProvider>,
			)
		})

		expect(
			screen.getByText('https://runtime.example/v1'),
		).toBeInTheDocument()
	})
})
