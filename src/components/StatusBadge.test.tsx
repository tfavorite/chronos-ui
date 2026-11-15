import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { PartStatus } from '../api/types'
import { renderWithProviders } from '../test/renderWithProviders'
import { StatusBadge } from './StatusBadge'

describe('StatusBadge', () => {
  it('shows the label of a known status', () => {
    renderWithProviders(<StatusBadge status="deprecated" />)
    expect(screen.getByText('Deprecated')).toBeInTheDocument()
  })

  it('does not crash on an unknown status; it shows the raw text', () => {
    renderWithProviders(<StatusBadge status={'mystery' as PartStatus} />)
    expect(screen.getByText('mystery')).toBeInTheDocument()
  })
})
