import { PawPrint } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import type { Pet } from '../model/types'

export function PetCard({ pet, className }: { pet: Pet; className?: string }) {
	return (
		<div
			className={cn(
				'rounded-lg border border-border bg-card p-4 text-card-foreground',
				className,
			)}
		>
			<div className='flex items-center gap-2 font-medium'>
				<PawPrint
					className='size-4 text-muted-foreground'
					aria-hidden
				/>
				{pet.name || 'Unnamed'}
			</div>
			<div className='text-sm text-muted-foreground'>
				{pet.status ?? 'unknown'}
			</div>
		</div>
	)
}
