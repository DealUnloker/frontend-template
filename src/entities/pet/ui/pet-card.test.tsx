import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import { PetCard } from './pet-card'

it('renders pet name and status', () => {
	render(
		<PetCard
			pet={{
				id: 1,
				name: 'doggie',
				status: 'available',
				species: 'dog',
				tags: [],
				createdAt: '2026-01-01T00:00:00Z',
			}}
		/>,
	)

	expect(screen.getByText('doggie')).toBeInTheDocument()
	expect(screen.getByText('available')).toBeInTheDocument()
})
