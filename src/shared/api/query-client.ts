import {
	environmentManager,
	MutationCache,
	QueryCache,
	QueryClient,
} from '@tanstack/react-query'
import { logValidationError } from './log-validation-error'

export function makeQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: {
				// On the server a query never refetches, so staleness means nothing
				// there, yet working it out reads the clock. Cache Components treats
				// a clock read as request-time data: a component calling useQuery
				// would drop out of the static shell, taking its Suspense boundary
				// (the whole page, under app/loading.tsx) with it.
				staleTime: environmentManager.isServer() ? 'static' : 60 * 1000,
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
