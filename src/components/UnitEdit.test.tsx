import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import type { Part } from '../api/types'
import { renderWithProviders } from '../test/renderWithProviders'
import { UnitEdit } from './UnitEdit'

const part: Part = { uuid: 'p1', partNo: 'TM-1020', name: 'Power Cell', status: 'active', unit: 'pcs' }

describe('UnitEdit', () => {
  it('opens a modal and only enables saving once the unit differs', async () => {
    const user = userEvent.setup()
    renderWithProviders(<UnitEdit part={part} />)

    await user.click(screen.getByRole('button', { name: 'Change unit' }))
    const input = await screen.findByLabelText('Unit')
    expect(input).toHaveValue('pcs')
    expect(screen.getByText(/everywhere it is used/i)).toBeInTheDocument()

    const save = screen.getAllByRole('button', { name: 'Change unit' }).at(-1)
    expect(save).toBeDisabled()
    await user.clear(input)
    expect(save).toBeDisabled()
    await user.type(input, 'set')
    expect(save).toBeEnabled()
  })
})
