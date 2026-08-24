import Link from 'next/link'
import { Routes } from '@/shared/config/routes'
import { Button } from '@/shared/ui/button'

export default function NotFound() {
	return (
		<main className='flex min-h-dvh flex-col items-center justify-center gap-4'>
			<p className='text-muted-foreground text-sm'>404</p>
			<h1 className='text-2xl font-semibold'>Page not found</h1>
			<Button variant='outline' render={<Link href={Routes.main} />}>
				Go home
			</Button>
		</main>
	)
}
