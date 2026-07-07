import { HomePage } from '@/pages/home/ui/home-page'

// ISR: the page (with its SSR-prefetched API data) is served instantly from
// cache and regenerated in the background at most every 60 seconds, so the
// data snapshot never gets older than a minute.
export const revalidate = 60

export default function Page() {
	return <HomePage />
}
