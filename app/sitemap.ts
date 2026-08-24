import type { MetadataRoute } from 'next'
import { connection } from 'next/server'
import env from '@/shared/config/env'
import { Routes } from '@/shared/config/routes'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	// Cache Components prerenders this route otherwise, baking the build-time
	// SITE_URL into sitemap.xml. connection() defers it to the request.
	await connection()

	return Object.values(Routes).map((route) => ({
		url: new URL(route, env.SITE_URL).href,
	}))
}
