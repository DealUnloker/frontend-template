'use client'

import { useEffect } from 'react'
import { Button } from '@/shared/ui/button'

export default function ErrorPage({
	error,
	reset,
}: {
	error: Error & { digest?: string }
	reset: () => void
}) {
	useEffect(() => {
		console.error(error)
	}, [error])

	return (
		<main className='flex min-h-dvh flex-col items-center justify-center gap-4'>
			<h1 className='text-2xl font-semibold'>Something went wrong</h1>
			<Button onClick={reset}>Try again</Button>
		</main>
	)
}
