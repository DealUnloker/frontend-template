import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: 'Frontend Template',
		short_name: 'Frontend Template',
		description:
			'Next.js App Router template with Feature-Sliced Design and a typed OpenAPI client',
		start_url: '/',
		display: 'standalone',
		background_color: '#ffffff',
		theme_color: '#ffffff',
	}
}
