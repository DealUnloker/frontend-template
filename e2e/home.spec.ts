import { expect, test } from '@playwright/test'

test('home page shows an SSR-prefetched pet', async ({ page }) => {
	await page.goto('/')

	await expect(page.getByRole('heading', { name: 'Petstore' })).toBeVisible()

	// Pet IDs from the demo list render as filter buttons
	await expect(page.getByRole('button', { name: '#2' })).toBeVisible()
})

test('unknown route renders the 404 page', async ({ page }) => {
	await page.goto('/definitely-not-a-page')

	await expect(page.getByRole('heading', { name: '404' })).toBeVisible()
	await expect(page.getByRole('link', { name: 'Go home' })).toBeVisible()
})
