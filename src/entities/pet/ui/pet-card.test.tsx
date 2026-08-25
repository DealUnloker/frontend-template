import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { Pet } from '../model/types'
import { PetCard } from './pet-card'

describe('PetCard', () => {
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

	it('falls back when fields are missing', () => {
		// Simulates out-of-spec data on purpose: Pet requires these fields, but
		// PetCard still needs to degrade gracefully if the API ever sends less.
		render(<PetCard pet={{ name: '', tags: [] } as unknown as Pet} />)

		expect(screen.getByText('Unnamed')).toBeInTheDocument()
		expect(screen.getByText('unknown')).toBeInTheDocument()
	})
})
