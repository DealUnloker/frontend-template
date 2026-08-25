import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { cacheLife } from 'next/cache'
import { petQueries } from '@/entities/pet/api/pet.options'
import { DEFAULT_PET_ID } from '@/features/select-pet/model/demo-pet-ids'
import { makeQueryClient } from '@/shared/api/query-client'
import { createBackendApiClients } from '@/shared/api/server-api-client'
import { PetDetails } from '@/widgets/pet-details/ui/pet-details'

// The prefetched snapshot is cached and regenerated in the background at most
// every 60 seconds — cacheLife('minutes').revalidate, the Cache Components
// form of the `export const revalidate = 60` this route used to carry.
export async function HomePage() {
	'use cache'
	cacheLife('minutes')

	const { api } = await createBackendApiClients()
	const queryClient = makeQueryClient()

	await queryClient.prefetchQuery(petQueries.byId(api, DEFAULT_PET_ID))

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<main className='mx-auto max-w-4xl px-4 py-8'>
				<h1 className='mb-6 text-2xl font-semibold'>Mockzoo</h1>
				<PetDetails />
			</main>
		</HydrationBoundary>
	)
}
