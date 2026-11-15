import { adapterOas } from '@kubb/adapter-oas'
import { pluginFetch } from '@kubb/plugin-fetch'
import { pluginReactQuery } from '@kubb/plugin-react-query'
import { pluginTs } from '@kubb/plugin-ts'
import { pluginZod } from '@kubb/plugin-zod'
import { defineConfig } from 'kubb/config'

// Spec path relative to API_URL. API_URL must be the full API base URL
// (including any base path like /v1) — the runtime client uses it as baseURL.
const SPEC_PATH = 'openapi.json'

// The CLI reports plugin names and options to otlp.kubb.dev unless this is set;
// it is read when the run ends, so setting it here is early enough.
process.env.KUBB_DISABLE_TELEMETRY ??= '1'

export default defineConfig(async () => {
	try {
		// Variables already set in the environment win over the file.
		process.loadEnvFile('.env.local')
	} catch {
		// .env.local is optional.
	}
	const { default: env } = await import('./src/shared/config/env')
	return {
		input: `${env.API_URL}/${SPEC_PATH}`,
		output: { path: './generated/backend-api', clean: true },
		// int64 defaults to bigint, which JSON (query keys, dehydrate) cannot carry.
		adapter: adapterOas({ integerType: 'number' }),
		plugins: [
			pluginTs(),
			pluginZod(),
			pluginFetch({ validator: { response: 'zod' } }),
			// Without the hooks the plugin still emits an unexported
			// `*QueryKey` type that nothing uses, which fails `noUnusedLocals`.
			pluginReactQuery({ hooks: true }),
		],
	}
})
