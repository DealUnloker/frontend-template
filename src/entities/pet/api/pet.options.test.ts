import {
	createClient,
	ResponseError,
} from '@generated/backend-api/.kubb/client'
import { ParseError } from '@generated/backend-api/.kubb/standardSchema'
import { dehydrate, hydrate } from '@tanstack/react-query'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { makeQueryClient } from '@/shared/api/query-client'
import type { Pet } from '../model/types'
import { petQueries } from './pet.options'

const API_URL = 'https://runtime.example/v1'

const pet: Pet = {
	id: 1,
	name: 'doggie',
	status: 'available',
	species: 'dog',
	tags: [],
	createdAt: '2026-01-01T00:00:00Z',
}

function stubFetch(body: unknown, init?: ResponseInit) {
	const fetch = vi.fn(async (_request: Request) => Response.json(body, init))
	vi.stubGlobal('fetch', fetch)
	return fetch
}

afterEach(() => {
	vi.unstubAllGlobals()
})

describe('petQueries.byId', () => {
	it('sends the request through the client it is given', async () => {
		const fetch = stubFetch(pet)
		const api = createClient({ baseURL: API_URL })

		const data = await makeQueryClient().fetchQuery(petQueries.byId(api, 1))

		expect(data).toEqual(pet)
		expect(fetch.mock.calls[0]?.[0].url).toBe(`${API_URL}/pets/1`)
	})

	it('reads a server prefetch from the hydrated cache', async () => {
		stubFetch(pet)
		const server = makeQueryClient()
		await server.fetchQuery(
			petQueries.byId(createClient({ baseURL: API_URL }), 1),
		)

		const browser = makeQueryClient()
		hydrate(browser, dehydrate(server))

		// A different client instance, as the browser builds its own.
		const { queryKey } = petQueries.byId(
			createClient({ baseURL: API_URL }),
			1,
		)
		expect(browser.getQueryData(queryKey)).toEqual(pet)
	})

	it('rejects and logs a response that does not match the schema', async () => {
		const consoleError = vi
			.spyOn(console, 'error')
			.mockImplementation(() => {})
		stubFetch({ ...pet, id: 'one' })
		const api = createClient({ baseURL: API_URL })

		await expect(
			makeQueryClient().fetchQuery(petQueries.byId(api, 1)),
		).rejects.toBeInstanceOf(ParseError)
		expect(consoleError).toHaveBeenCalledWith(
			expect.stringMatching(
				/^\[api\] Response validation failed — .*\n✖ .*\n {2}→ at id$/,
			),
		)

		consoleError.mockRestore()
	})

	it('rejects a non-2xx response with the API error, not a validation failure', async () => {
		const consoleError = vi
			.spyOn(console, 'error')
			.mockImplementation(() => {})
		stubFetch(
			{ error: { code: 'not_found', message: 'Pet not found' } },
			{ status: 404 },
		)
		const api = createClient({ baseURL: API_URL })

		await expect(
			makeQueryClient().fetchQuery(petQueries.byId(api, 1)),
		).rejects.toBeInstanceOf(ResponseError)
		expect(consoleError).not.toHaveBeenCalled()

		consoleError.mockRestore()
	})

	it('aborts the request when the query is cancelled', async () => {
		const fetch = vi.fn(
			(request: Request) =>
				new Promise<Response>((_resolve, reject) => {
					request.signal.addEventListener('abort', () =>
						reject(request.signal.reason),
					)
				}),
		)
		vi.stubGlobal('fetch', fetch)
		const queryClient = makeQueryClient()

		const pending = queryClient.fetchQuery(
			petQueries.byId(createClient({ baseURL: API_URL }), 1),
		)
		await vi.waitFor(() => expect(fetch).toHaveBeenCalled())
		await queryClient.cancelQueries()

		await expect(pending).rejects.toBeDefined()
		expect(fetch.mock.calls[0]?.[0].signal.aborted).toBe(true)
	})
})
