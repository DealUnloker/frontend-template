import type { MetadataRoute } from 'next'
import { connection } from 'next/server'
import env from '@/shared/config/env'

export default async function robots(): Promise<MetadataRoute.Robots> {
	// Cache Components prerenders this route otherwise, baking the build-time
	// SITE_URL into robots.txt. connection() defers it to the request.
	await connection()

	return {
		rules: { userAgent: '*', allow: '/' },
		sitemap: `${env.SITE_URL}/sitemap.xml`,
	}
}
