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
		<fieldset className='flex gap-2'>
			{/* The '#2'-style button names carry no context on their own */}
			<legend className='sr-only'>Demo pet IDs</legend>
			{DEMO_PET_IDS.map((petId) => (
				<Button
					key={petId}
					variant={petId === value ? 'default' : 'outline'}
					size='sm'
					aria-pressed={petId === value}
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
		</fieldset>
	)
}
