import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
	reactStrictMode: true,
	reactCompiler: true,
	poweredByHeader: false,
	typedRoutes: true,
	output: process.env.DOCKER_BUILD ? 'standalone' : undefined,
}

export default nextConfig
