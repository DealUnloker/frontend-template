import { defineConfig, type UserConfig } from '@hey-api/openapi-ts'

// Spec path relative to API_URL. API_URL must be the full API base URL
// (including any base path like /v1) — the runtime client uses it as baseUrl.
const SPEC_PATH = 'openapi.json'

const apiClient: Omit<UserConfig, 'input'> = {
	output: './generated/backend-api',
	plugins: [
		{
			name: '@hey-api/sdk',
			validator: {
				response: 'zod',
			},
		},
		{
			name: '@tanstack/react-query',
		},
		{
			name: '@hey-api/client-next',
		},
		{
			name: '@hey-api/typescript',
		},
		{
			name: 'zod',
		},
	],
}

export default defineConfig(async () => {
	if (!process.env.API_URL) {
		try {
			process.loadEnvFile('.env.local')
		} catch {
			// .env.local is optional when API_URL is provided by the environment.
		}
	}
	const { default: env } = await import('./src/shared/config/env')
	return [{ ...apiClient, input: `${env.API_URL}/${SPEC_PATH}` }]
})
