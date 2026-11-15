'use client'

import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { petQueries } from '@/entities/pet/api/pet.options'
import { PetCard, PetCardSkeleton } from '@/entities/pet/ui/pet-card'
import { DEFAULT_PET_ID } from '@/features/select-pet/model/demo-pet-ids'
import { PetIdSelect } from '@/features/select-pet/ui/pet-id-select'
import { useApiClient } from '@/shared/api/api-client'

export function PetDetails() {
	const api = useApiClient()
	const [petId, setPetId] = useState<number>(DEFAULT_PET_ID)
	const { data: pet, isError } = useQuery(petQueries.byId(api, petId))

	return (
		<section className='flex flex-col gap-4'>
			<PetIdSelect value={petId} onChange={setPetId} />
			{/* Always mounted: a live region that appears together with its
			    content is not reliably announced by screen readers. */}
			<div aria-live='polite' aria-atomic='true'>
				{pet ? (
					<PetCard pet={pet} />
				) : isError ? (
					<p className='text-destructive'>Failed to load pet</p>
				) : (
					<PetCardSkeleton />
				)}
			</div>
		</section>
	)
}
