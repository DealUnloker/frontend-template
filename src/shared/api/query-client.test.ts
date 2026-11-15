import { ResponseError } from '@generated/backend-api/.kubb/client'
import { ParseError } from '@generated/backend-api/.kubb/standardSchema'
import { expect, test } from 'vitest'
import { makeQueryClient } from './query-client'

const retry = makeQueryClient().getDefaultOptions().queries?.retry as (
	failureCount: number,
	error: Error,
) => boolean

const responseError = (status: number) =>
	new ResponseError({
		data: undefined,
		status,
		statusText: '',
		request: new Request('http://api.test/pets/1'),
		response: new Response(null, { status }),
	})

test('retries network failures and 5xx twice', () => {
	for (const error of [
		new TypeError('Failed to fetch'),
		responseError(500),
	]) {
		expect(retry(0, error)).toBe(true)
		expect(retry(1, error)).toBe(true)
		expect(retry(2, error)).toBe(false)
	}
})

test('does not retry 4xx and invalid responses', () => {
	expect(retry(0, responseError(499))).toBe(false)
	expect(retry(0, new ParseError({ issues: [] }))).toBe(false)
})
