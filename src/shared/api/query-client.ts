import { ResponseError } from '@generated/backend-api/.kubb/client'
import { ParseError } from '@generated/backend-api/.kubb/standardSchema'
import {
	environmentManager,
	QueryCache,
	QueryClient,
} from '@tanstack/react-query'

// Only failures that can heal by themselves are worth a retry: a 4xx or a
// schema mismatch gives the same answer again.
function retryTransient(failureCount: number, error: Error) {
	if (error instanceof ParseError) return false
	if (ResponseError.is(error) && error.status < 500) return false
	return failureCount < 2
}

export function makeQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: {
				// A numeric staleTime makes useQuery read the clock during render,
				// which drops the component out of the static shell.
				staleTime: environmentManager.isServer() ? 'static' : 60_000,
				retry: environmentManager.isServer() ? false : retryTransient,
			},
		},
		queryCache: new QueryCache({
			// The UI only shows that a query failed, and the server prefetch
			// swallows its errors: a schema mismatch would leave no trace.
			onError: (error, query) => {
				if (error instanceof ParseError) {
					console.error(
						`[api] Invalid response for ${query.queryHash}`,
						error.issues,
					)
				}
			},
		}),
	})
}
