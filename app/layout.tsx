import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { AppProviders } from '@/app/providers/app-providers'
import './globals.css'

export const metadata: Metadata = {
	title: {
		default: 'Frontend Template',
		template: '%s | Frontend Template',
	},
	description:
		'Next.js App Router template with Feature-Sliced Design and a typed OpenAPI client',
}

export const viewport: Viewport = { colorScheme: 'light' }

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang='en'>
			<body className='bg-background text-foreground antialiased'>
				<AppProviders>{children}</AppProviders>
			</body>
		</html>
	)
}
