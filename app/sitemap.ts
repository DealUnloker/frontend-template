import type { MetadataRoute } from 'next'
import env from '@/shared/config/env'
import { Routes } from '@/shared/config/routes'

// Render per request so SITE_URL is read at runtime (e.g. from the container
// environment), not baked in at build time.
export const dynamic = 'force-dynamic'

export default function sitemap(): MetadataRoute.Sitemap {
	return Object.values(Routes).map((route) => ({
		url: new URL(route, env.SITE_URL).href,
	}))
}
