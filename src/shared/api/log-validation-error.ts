import { ParseError } from '@generated/backend-api/.kubb/standardSchema'
import { z } from 'zod'

/**
 * Logs Zod response-validation failures. Wired into the React Query
 * caches, so it runs both in the browser console and on the server
 * (SSR prefetch), where errors would otherwise be swallowed silently.
 */
export function logValidationError(error: unknown, source: string) {
	if (!(error instanceof ParseError)) return

	// The generated client throws Standard Schema issues, whose `message` is
	// optional; Zod's formatter requires it.
	const issues = error.issues.map((issue) => ({
		...issue,
		message: issue.message ?? 'Invalid value',
	}))

	console.error(
		`[api] Response validation failed — ${source}\n${z.prettifyError({ issues })}`,
	)
}
