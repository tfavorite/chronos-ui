import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ApiError } from '../api/client'
import { renderWithProviders } from '../test/renderWithProviders'
import { ErrorAlert } from './ErrorAlert'

describe('ErrorAlert', () => {
  it('offers Retry for server errors', () => {
    renderWithProviders(<ErrorAlert title="Oops" error={new ApiError(500, 'The server had a problem.')} onRetry={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument()
  })

  it('explains a 404 and does not offer Retry', () => {
    renderWithProviders(<ErrorAlert title="Oops" error={new ApiError(404, 'Part not found')} onRetry={vi.fn()} />)
    expect(screen.getByText(/Part not found. It may have been removed/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument()
  })

  it('does not double the full stop and uses the given hint', () => {
    renderWithProviders(<ErrorAlert title="Oops" error={new ApiError(404, 'Part not found.')} notFoundHint="Go back." />)
    expect(screen.getByText('Part not found. Go back.')).toBeInTheDocument()
  })
})
