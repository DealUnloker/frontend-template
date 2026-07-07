'use client'

// Catches errors thrown by the root layout itself; must render its own
// <html>/<body> because the layout is not available at this point.
export default function GlobalError({ reset }: { reset: () => void }) {
	return (
		<html lang='en'>
			<body>
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
					<button type='button' onClick={reset}>
						Try again
					</button>
				</main>
			</body>
		</html>
	)
}
