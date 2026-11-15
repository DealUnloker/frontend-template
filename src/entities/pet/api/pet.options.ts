import type { ClientInstance } from '@generated/backend-api/.kubb/client'
import { getPetByIdQueryOptions } from '@generated/backend-api/hooks/useGetPetById'

/**
 * Entity query options wrapping the generated Kubb queryOptions.
 * Pass the client from `useApiClient('api')` (browser)
 * or `createBackendApiClients()` (server).
 */
export const petQueries = {
	byId: (client: ClientInstance, petId: number) =>
		getPetByIdQueryOptions({ path: { petId } }, { client }),
}
