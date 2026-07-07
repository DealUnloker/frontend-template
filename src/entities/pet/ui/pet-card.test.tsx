import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PetCard } from './pet-card'

describe('PetCard', () => {
	it('renders pet name and status', () => {
		render(
			<PetCard
				pet={{ name: 'doggie', photoUrls: [], status: 'available' }}
			/>,
		)

		expect(screen.getByText('doggie')).toBeInTheDocument()
		expect(screen.getByText('available')).toBeInTheDocument()
	})

	it('falls back when fields are missing', () => {
		render(<PetCard pet={{ name: '', photoUrls: [] }} />)

		expect(screen.getByText('Unnamed')).toBeInTheDocument()
		expect(screen.getByText('unknown')).toBeInTheDocument()
	})
})
