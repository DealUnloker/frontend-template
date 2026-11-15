import type { Pet } from '@generated/backend-api/types/Pet'
import { PawPrint } from 'lucide-react'
import { Skeleton } from '@/shared/ui/skeleton'

const cardClassName =
	'max-w-sm rounded-lg border border-border bg-card p-4 text-card-foreground'

export function PetCard({ pet }: { pet: Pet }) {
	return (
		<div className={cardClassName}>
			<div className='flex items-center gap-2 font-medium'>
				<PawPrint
					className='size-4 text-muted-foreground'
					aria-hidden
				/>
				{pet.name}
			</div>
			<div className='text-sm text-muted-foreground'>{pet.status}</div>
		</div>
	)
}

/** Takes exactly the space of a loaded card, so nothing shifts when it lands. */
export function PetCardSkeleton() {
	return (
		<div className={`${cardClassName} flex flex-col`}>
			<span className='sr-only'>Loading pet…</span>
			<Skeleton className='my-1 h-4 w-32' />
			<Skeleton className='my-1 h-3 w-20' />
		</div>
	)
}
