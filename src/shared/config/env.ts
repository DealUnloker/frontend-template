import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

const env = createEnv({
	server: {
		API_URL: z.url(),
		// Public origin for robots.txt and sitemap.xml.
		SITE_URL: z.url().default('http://localhost:3000'),
	},
	experimental__runtimeEnv: {},
	skipValidation: !!process.env.SKIP_ENV_VALIDATION,
})

export default env
