import fsd from '@feature-sliced/steiger-plugin'
import { defineConfig } from 'steiger'

export default defineConfig([
	...fsd.configs.recommended,
	{
		rules: {
			'fsd/public-api': 'off',
			'fsd/no-public-api-sidestep': 'off',
			'fsd/insignificant-slice': 'warn',
		},
	},
])
