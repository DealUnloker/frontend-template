import type { UserConfig } from '@hey-api/openapi-ts'
import env from './src/shared/config/env'

// Spec path relative to API_URL. API_URL must be the full API base URL
// (including any base path like /v1) — the runtime client uses it as baseUrl.
const SPEC_PATH = 'openapi.json'

const apiClient: UserConfig = {
	input: `${env.API_URL}/${SPEC_PATH}`,
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

export default [apiClient]
