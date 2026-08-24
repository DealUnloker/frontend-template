import { expect, test } from '@playwright/test'

test('home page shows an SSR-prefetched pet', async ({ page }) => {
	await page.goto('/')

	await expect(page.getByRole('heading', { name: 'Petstore' })).toBeVisible()

	// Pet IDs from the demo list render as filter buttons
	await expect(page.getByRole('button', { name: '#9' })).toBeVisible()
})

test('pet data is server-rendered, not fetched by the browser', async ({
	request,
}) => {
	// Raw HTML, no browser: nothing here can have come from a client fetch.
	const html = await (await request.get('/')).text()

	// The dehydrated cache only reaches the HTML when the server prefetch ran
	// and succeeded — dehydrate() keeps successful queries only.
	expect(html).toMatch(/getPetById/)

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

test('unknown route renders the 404 page', async ({ page }) => {
	await page.goto('/definitely-not-a-page')

	await expect(page.getByRole('heading', { name: '404' })).toBeVisible()
	await expect(page.getByRole('link', { name: 'Go home' })).toBeVisible()
})
