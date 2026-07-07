'use client'

import { toast } from 'sonner'
import { Button } from '@/shared/ui/button'
import { DEMO_PET_IDS } from '../model/demo-pet-ids'

export function PetIdSelect({
	value,
	onChange,
}: {
	value: number
	onChange: (petId: number) => void
}) {
	return (
		<div className='flex gap-2'>
			{DEMO_PET_IDS.map((petId) => (
				<Button
					key={petId}
					variant={petId === value ? 'default' : 'outline'}
					size='sm'
					onClick={() => {
						if (petId !== value) {
							// Sonner demo — toasts render via <Toaster /> in app/layout.tsx
							toast(`Loading pet #${petId}…`)
						}
						onChange(petId)
					}}
				>
					#{petId}
				</Button>
			))}
		</div>
	)
}
