import { readFileSync } from 'node:fs'
import { expect, test } from '@playwright/test'

test('the prerendered shell contains the page and the pet widget', () => {
	// The static shell is what Next serves before any request-time work;
	// anything missing from it arrives late, behind a fallback. A component
	// drops out of it by suspending on runtime data or by reading the clock
	// while rendering, and takes its whole Suspense boundary along.
	const shell = readFileSync('.next/server/app/index.html', 'utf8')

	expect(shell).toMatch(/<h1[^>]*>Mockzoo<\/h1>/)
	// The pet ID buttons need no API.
	expect(shell).toContain('aria-pressed')
	// The pet card needs the build to have reached the API.
	expect(shell).toMatch(/lucide-paw-print/)
})

test('home page shows an SSR-prefetched pet', async ({ page }) => {
	await page.goto('/')

	await expect(page.getByRole('heading', { name: 'Mockzoo' })).toBeVisible()

	// Pet IDs from the demo list render as filter buttons
	await expect(page.getByRole('button', { name: '#1' })).toBeVisible()
})

test('pet data is server-rendered, not fetched by the browser', async ({
	request,
}) => {
	// Raw HTML, no browser: nothing here can have come from a client fetch.
	const html = await (await request.get('/')).text()

	// The dehydrated cache only reaches the HTML when the server prefetch ran
	// and succeeded — dehydrate() keeps successful queries only. The marker
	// is the generated query key of the pet query.
	expect(html).toMatch(/\/pets\/:petId/)

	// PetCard renders only once the query has data, and its icon appears
	// nowhere else on the page.
	expect(html).toMatch(/lucide-paw-print/)
	expect(html).not.toContain('Loading pet')
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
	// A response alone proves little: the card renders only data that passed
	// response validation.
	await expect(page.getByText(pet.name, { exact: true })).toBeVisible()
})

test.describe('without JavaScript', () => {
	test.use({ javaScriptEnabled: false })

	test('the pet widget is in the document, not revealed by a script', async ({
		page,
	}) => {
		// Content streamed into a Suspense boundary stays hidden until React's
		// inline script reveals it, and once the fallback has painted React
		// holds that reveal for 300 ms. With scripts off, only what the
		// document itself contains is visible.
		await page.goto('/')

		await expect(page.getByRole('button', { name: '#1' })).toBeVisible()
		await expect(page.locator('.lucide-paw-print')).toBeVisible()
	})
})

test('unknown route renders the 404 page', async ({ page }) => {
	await page.goto('/definitely-not-a-page')

	await expect(
		page.getByRole('heading', { name: 'Page not found' }),
	).toBeVisible()
	await expect(page.getByRole('link', { name: 'Go home' })).toBeVisible()
})
