import { LoaderCircle } from 'lucide-react'

export default function Loading() {
	return (
		<main className='flex min-h-dvh items-center justify-center gap-2 text-muted-foreground'>
			<LoaderCircle
				className='size-4 motion-safe:animate-spin'
				aria-hidden
			/>
			<p>Loading…</p>
		</main>
	)
}
