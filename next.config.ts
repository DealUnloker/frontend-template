import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
	cacheComponents: true,
	partialPrefetching: true,
	reactCompiler: true,
	experimental: { turbopackRustReactCompiler: true },
	poweredByHeader: false,
	typedRoutes: true,
	output: process.env.DOCKER_BUILD ? 'standalone' : undefined,
	headers() {
		return [
			{
				source: '/:path*',
				headers: [
					{ key: 'X-Content-Type-Options', value: 'nosniff' },
					{
						key: 'Referrer-Policy',
						value: 'strict-origin-when-cross-origin',
					},
					{
						key: 'Permissions-Policy',
						value: 'camera=(), microphone=(), geolocation=()',
					},
					{ key: 'X-Frame-Options', value: 'DENY' },
				],
			},
		]
	},
}

export default nextConfig
