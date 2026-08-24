'use client'

import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { petQueries } from '@/entities/pet/api/pet.options'
import { PetCard } from '@/entities/pet/ui/pet-card'
import { DEFAULT_PET_ID } from '@/features/select-pet/model/demo-pet-ids'
import { PetIdSelect } from '@/features/select-pet/ui/pet-id-select'
import { useApiClient } from '@/shared/api/use-api-client'

export function PetDetails() {
	const api = useApiClient('api')
	const [petId, setPetId] = useState<number>(DEFAULT_PET_ID)
	const {
		data: pet,
		isPending,
		isError,
	} = useQuery(petQueries.byId(api, petId))

	return (
		<section className='flex flex-col gap-4'>
			<PetIdSelect value={petId} onChange={setPetId} />
			{/* Always mounted: a live region that appears at the same moment as
			    its text is not reliably announced by screen readers. */}
			<div aria-live='polite' aria-atomic='true'>
				{isPending && (
					<p className='text-muted-foreground'>Loading pet…</p>
				)}
				{isError && (
					<p className='text-destructive'>
						Failed to load pet (see console for validation details)
					</p>
				)}
			</div>
			{pet && <PetCard pet={pet} className='max-w-sm' />}
		</section>
	)
}
