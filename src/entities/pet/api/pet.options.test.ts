import { createClient } from '@generated/backend-api/.kubb/client'
import { ParseError } from '@generated/backend-api/.kubb/standardSchema'
import type { Pet } from '@generated/backend-api/types/Pet'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { makeQueryClient } from '@/shared/api/query-client'
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

function fetchPet(body: unknown) {
	const fetch = vi.fn(async (_request: Request) => Response.json(body))
	vi.stubGlobal('fetch', fetch)
	const options = petQueries.byId(createClient({ baseURL: API_URL }), 1)
	return { fetch, result: makeQueryClient().fetchQuery(options) }
}

afterEach(() => {
	vi.restoreAllMocks()
	vi.unstubAllGlobals()
})

describe('petQueries.byId', () => {
	it('sends the request through the client it is given', async () => {
		const { fetch, result } = fetchPet(pet)

		expect(await result).toEqual(pet)
		expect(fetch.mock.calls[0]?.[0].url).toBe(`${API_URL}/pets/1`)
	})

	it('rejects and logs a response that does not match the schema', async () => {
		const consoleError = vi
			.spyOn(console, 'error')
			.mockImplementation(() => {})
		const { result } = fetchPet({ ...pet, id: 'one' })

		await expect(result).rejects.toBeInstanceOf(ParseError)
		expect(consoleError).toHaveBeenCalledWith(
			expect.stringContaining('[api] Invalid response'),
			[expect.objectContaining({ path: ['id'] })],
		)
	})
})
