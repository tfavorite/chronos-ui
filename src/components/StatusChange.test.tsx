import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Part } from '../api/types'
import { renderWithProviders } from '../test/renderWithProviders'
import { StatusChange } from './StatusChange'

const part: Part = { uuid: 'p1', partNo: 'TM-1020', name: 'Power Cell', status: 'active', unit: 'pcs' }

function mockFetch(handler: (url: string, init?: RequestInit) => { status: number; body: unknown }) {
  vi.stubGlobal(
    'fetch',
    vi.fn((url: string, init?: RequestInit) => {
      const { status, body } = handler(url, init)
      return Promise.resolve({ ok: status < 400, status, json: () => Promise.resolve(body) })
    }),
  )
}

afterEach(() => vi.unstubAllGlobals())

describe('StatusChange', () => {
  it('says the status is locked when no change is allowed', async () => {
    mockFetch(() => ({ status: 200, body: { partUuid: 'p1', currentStatus: 'active', allowableStatuses: ['active'] } }))
    renderWithProviders(<StatusChange part={part} />)
    expect(await screen.findByText(/status is locked/i)).toBeInTheDocument()
  })

  it('confirms, then sends the chosen status', async () => {
    mockFetch((_url, init) =>
      init?.method === 'PUT'
        ? { status: 200, body: { ...part, status: 'deprecated' } }
        : { status: 200, body: { partUuid: 'p1', currentStatus: 'active', allowableStatuses: ['active', 'deprecated'] } },
    )
    const user = userEvent.setup()
    renderWithProviders(<StatusChange part={part} />)

    await user.click(await screen.findByPlaceholderText('Choose a new status'))
    await user.click(await screen.findByRole('option', { name: 'Deprecated', hidden: true }))
    expect(await screen.findByText(/everywhere it is used/i)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Change status' }))

    await waitFor(() => {
      const calls = vi.mocked(fetch).mock.calls
      const put = calls.find(([, init]) => init?.method === 'PUT')
      expect(put?.[1]?.body).toBe(JSON.stringify({ status: 'deprecated' }))
    })
  })
})
