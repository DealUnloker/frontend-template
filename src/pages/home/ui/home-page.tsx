import { dehydrate, HydrationBoundary, noop } from '@tanstack/react-query'
import { cacheLife } from 'next/cache'
import { petQueries } from '@/entities/pet/api/pet.options'
import { DEFAULT_PET_ID } from '@/features/select-pet/model/demo-pet-ids'
import { makeQueryClient } from '@/shared/api/query-client'
import { createServerApiClient } from '@/shared/api/server-api-client'
import { PetDetails } from '@/widgets/pet-details/ui/pet-details'

export async function HomePage() {
	'use cache'
	// Regenerated in the background at most once a minute.
	cacheLife('minutes')

	const queryClient = makeQueryClient()
	// The Docker image is built without API_URL, and a failed prefetch must
	// not fail the build: the page starts empty and the browser fetches.
	await queryClient
		.query(petQueries.byId(createServerApiClient(), DEFAULT_PET_ID))
		.catch(noop)

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<main className='mx-auto max-w-4xl px-4 py-8'>
				<h1 className='mb-6 text-2xl font-semibold'>Mockzoo</h1>
				<PetDetails />
			</main>
		</HydrationBoundary>
	)
}
