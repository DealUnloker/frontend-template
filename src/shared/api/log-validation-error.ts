import { ZodError, z } from 'zod'

/**
 * Logs Zod response-validation failures. Wired into the React Query
 * caches, so it runs both in the browser console and on the server
 * (SSR prefetch), where errors would otherwise be swallowed silently.
 */
export function logValidationError(error: unknown, source: string) {
	if (!(error instanceof ZodError)) return

	console.error(
		`[api] Response validation failed — ${source}\n${z.prettifyError(error)}`,
	)
}
