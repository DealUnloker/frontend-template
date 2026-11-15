import { defineConfig } from 'vitest/config'

export default defineConfig({
	resolve: { tsconfigPaths: true },
	// No `reporters` key on purpose: Vitest auto-enables its token-minimal
	// `minimal` reporter when it detects an AI-agent environment, and configuring
	// any reporter here skips that detection. CI sets one via a CLI flag.
	test: {
		environment: 'jsdom',
		setupFiles: ['./vitest.setup.ts'],
		include: ['src/**/*.test.{ts,tsx}'],
	},
})
