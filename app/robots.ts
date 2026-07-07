import type { MetadataRoute } from 'next'
import env from '@/shared/config/env'

// Render per request so SITE_URL is read at runtime (e.g. from the container
// environment), not baked in at build time.
export const dynamic = 'force-dynamic'

export default function robots(): MetadataRoute.Robots {
	return {
		rules: { userAgent: '*', allow: '/' },
		sitemap: `${env.SITE_URL}/sitemap.xml`,
	}
}
