import type { ClientInstance } from '@generated/backend-api/.kubb/client'
import { getPetByIdQueryOptions } from '@generated/backend-api/hooks/useGetPetById'

/**
 * Pet query options. The client comes from `useApiClient()` in the browser
 * and from `createServerApiClient()` on the server.
 */
export const petQueries = {
	byId: (client: ClientInstance, petId: number) =>
		getPetByIdQueryOptions({ path: { petId } }, { client }),
}
