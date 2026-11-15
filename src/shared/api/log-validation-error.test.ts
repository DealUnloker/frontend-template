import { ParseError } from '@generated/backend-api/.kubb/standardSchema'
import { describe, expect, it, vi } from 'vitest'
import { logValidationError } from './log-validation-error'

describe('logValidationError', () => {
	it('logs the issues of a failed response validation', () => {
		const consoleError = vi
			.spyOn(console, 'error')
			.mockImplementation(() => {})

		logValidationError(
			new ParseError({
				issues: [{}, { message: 'Expected number', path: ['id'] }],
			}),
			'pet',
		)

		expect(consoleError).toHaveBeenCalledWith(
			'[api] Response validation failed — pet\n✖ Invalid value\n✖ Expected number\n  → at id',
		)

		consoleError.mockRestore()
	})

	it('ignores errors that are not validation failures', () => {
		const consoleError = vi
			.spyOn(console, 'error')
			.mockImplementation(() => {})

		logValidationError(new Error('network down'), 'pet')

		expect(consoleError).not.toHaveBeenCalled()

		consoleError.mockRestore()
	})
})
