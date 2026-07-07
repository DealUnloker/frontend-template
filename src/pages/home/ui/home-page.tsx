import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { petQueries } from '@/entities/pet/api/pet.options'
import { DEFAULT_PET_ID } from '@/features/select-pet/model/demo-pet-ids'
import { makeQueryClient } from '@/shared/api/query-client'
import { createBackendApiClients } from '@/shared/api/server-api-client'
import { PetDetails } from '@/widgets/pet-details/ui/pet-details'

export async function HomePage() {
	const { api } = await createBackendApiClients()
	const queryClient = makeQueryClient()

	await queryClient.prefetchQuery(petQueries.byId(api, DEFAULT_PET_ID))

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<main className='mx-auto max-w-4xl px-4 py-8'>
				<h1 className='mb-6 text-2xl font-semibold'>Petstore</h1>
				<PetDetails />
			</main>
		</HydrationBoundary>
	)
}
