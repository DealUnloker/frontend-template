import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
	plugins: [react()],
	resolve: {
		// Resolves the tsconfig `@/` and `@generated/` path aliases natively
		tsconfigPaths: true,
	},
	// No `reporters` key on purpose: Vitest 4.1 auto-enables its token-minimal
	// `agent` reporter when it detects an AI-agent environment, and configuring
	// any reporter here skips that detection. CI sets one via a CLI flag.
	test: {
		environment: 'jsdom',
		setupFiles: ['./vitest.setup.ts'],
		include: ['src/**/*.test.{ts,tsx}'],
		coverage: {
			include: ['src/**'],
		},
	},
})
