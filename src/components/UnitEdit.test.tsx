import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import type { Part } from '../api/types'
import { renderWithProviders } from '../test/renderWithProviders'
import { UnitEdit } from './UnitEdit'

const part: Part = { uuid: 'p1', partNo: 'TM-1020', name: 'Power Cell', status: 'active', unit: 'pcs' }

describe('UnitEdit', () => {
  it('only enables the button once the unit differs', async () => {
    const user = userEvent.setup()
    renderWithProviders(<UnitEdit part={part} />)
    const button = screen.getByRole('button', { name: 'Change unit' })
    expect(button).toBeDisabled()
    await user.clear(screen.getByLabelText('Change unit to'))
    expect(button).toBeDisabled()
    await user.type(screen.getByLabelText('Change unit to'), 'set')
    expect(button).toBeEnabled()
  })
})
