import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query'
import { logValidationError } from './log-validation-error'

export function makeQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: 60 * 1000,
			},
		},
		queryCache: new QueryCache({
			onError: (error, query) => {
				logValidationError(error, JSON.stringify(query.queryKey))
			},
		}),
		mutationCache: new MutationCache({
			onError: (error, _variables, _context, mutation) => {
				logValidationError(
					error,
					mutation.options.mutationKey
						? JSON.stringify(mutation.options.mutationKey)
						: 'mutation',
				)
			},
		}),
	})
}
