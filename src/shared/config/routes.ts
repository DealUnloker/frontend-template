const miscRoutes = {
	main: '/',
} as const

export const Routes = {
	...miscRoutes,
} as const

export type RouteKey = keyof typeof Routes
export type Route = (typeof Routes)[RouteKey]
