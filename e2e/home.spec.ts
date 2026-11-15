import { expect, test } from '@playwright/test'

test.describe('without JavaScript', () => {
	test.use({ javaScriptEnabled: false })

	test('the pet is server-rendered and in the static shell', async ({
		page,
	}) => {
		// With scripts off nothing fetches and nothing reveals streamed
		// content: what is visible is exactly the static shell.
		await page.goto('/')

		await expect(page.getByRole('button', { name: '#1' })).toBeVisible()
		// PetCard's icon: rendered only once the query has data.
		await expect(page.locator('.lucide-paw-print')).toBeVisible()
	})
})

test('the home page is served from cache, not re-rendered per request', async ({
	request,
}) => {
	const first = await (await request.get('/')).text()
	const second = await (await request.get('/')).text()

	// dehydrate() stamps every snapshot with Date.now(); a shared stamp means
	// both responses came out of one cached render.
	const stamp = (html: string) => html.match(/dehydratedAt\\?":(\d+)/)?.[1]

	expect(stamp(first)).toBeDefined()
	expect(stamp(second)).toBe(stamp(first))
})

test('selecting another pet loads it from the runtime API', async ({
	page,
}) => {
	await page.goto('/')

	// The browser client is created without a URL: the request waits for the
	// one the server streams in, so this fails if that hand-off breaks.
	const response = page.waitForResponse((res) =>
		new URL(res.url()).pathname.endsWith('/pets/2'),
	)
	const second = page.getByRole('button', { name: '#2' })
	// Retried: a click that lands before hydration is lost.
	await expect(async () => {
		await second.click()
		await expect(second).toHaveAttribute('aria-pressed', 'true', {
			timeout: 1000,
		})
	}).toPass()

	const pet = await (await response).json()
	// The card renders only data that passed response validation.
	await expect(page.getByText(pet.name, { exact: true })).toBeVisible()
})

test('unknown route renders the 404 page', async ({ page }) => {
	await page.goto('/definitely-not-a-page')

	await expect(
		page.getByRole('heading', { name: 'Page not found' }),
	).toBeVisible()
	await expect(page.getByRole('link', { name: 'Go home' })).toBeVisible()
})
