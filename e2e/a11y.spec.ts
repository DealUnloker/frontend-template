import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const pages = [
	{ path: '/', heading: 'Mockzoo' },
	{ path: '/definitely-not-a-page', heading: 'Page not found' },
]

for (const { path, heading } of pages) {
	test(`${path} has no axe violations`, async ({ page }) => {
		await page.goto(path)
		// Without this a mistyped route would scan the 404 page and pass.
		await expect(
			page.getByRole('heading', { level: 1, name: heading }),
		).toBeVisible()

		const { violations } = await new AxeBuilder({ page }).analyze()

		expect(violations).toEqual([])
	})
}
