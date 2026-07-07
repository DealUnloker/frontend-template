import { getPetByIdOptions } from '@generated/backend-api/@tanstack/react-query.gen'
import type { Client } from '@generated/backend-api/client'

/**
 * Entity query options wrapping the generated Hey API queryOptions.
 * Pass the client from `useApiClient('api')` (browser)
 * or `createBackendApiClients()` (server).
 */
export const petQueries = {
	byId: (client: Client, petId: number) =>
		getPetByIdOptions({ client, path: { petId } }),
}
