'use client'

import { useEffect } from 'react'

// Catches errors thrown by the root layout itself; must render its own
// <html>/<body> because the layout is not available at this point.
export default function GlobalError({
	error,
	retry,
}: {
	error: Error & { digest?: string }
	retry: () => void
}) {
	useEffect(() => {
		console.error(error)
	}, [error])

	return (
		<html lang='en'>
			<body>
				<title>Something went wrong | Frontend Template</title>
				<main
					style={{
						minHeight: '100dvh',
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						justifyContent: 'center',
						gap: 16,
					}}
				>
					<h1>Something went wrong</h1>
					<button type='button' onClick={retry}>
						Try again
					</button>
				</main>
			</body>
		</html>
	)
}
