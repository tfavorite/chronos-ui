import { Notifications } from '@mantine/notifications'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Part } from '../api/types'
import { renderWithProviders } from '../test/renderWithProviders'
import { StatusChange } from './StatusChange'

const part: Part = { uuid: 'p1', partNo: 'TM-1020', name: 'Power Cell', status: 'active', unit: 'pcs' }
const allowed = (statuses: string[]) => ({ partUuid: 'p1', currentStatus: 'active', allowableStatuses: statuses })

function mockFetch(handler: (url: string, init?: RequestInit) => { status: number; body: unknown }) {
  vi.stubGlobal(
    'fetch',
    vi.fn((url: string, init?: RequestInit) => {
      const { status, body } = handler(url, init)
      return Promise.resolve({ ok: status < 400, status, text: () => Promise.resolve(JSON.stringify(body)) })
    }),
  )
}

// The modal's own save button, as opposed to the "Update status" link behind it.
async function saveButton() {
  const dialog = await screen.findByRole('dialog')
  return within(dialog).getByRole('button', { name: 'Update status' })
}

async function chooseDeprecated(user: ReturnType<typeof userEvent.setup>) {
  await user.click(await screen.findByRole('button', { name: 'Update status' }))
  await user.click(await screen.findByPlaceholderText('Choose a new status'))
  await user.click(await screen.findByRole('option', { name: 'Deprecated', hidden: true }))
}

afterEach(() => vi.unstubAllGlobals())

describe('StatusChange', () => {
  it('renders nothing when no change is allowed', async () => {
    mockFetch(() => ({ status: 200, body: allowed(['active']) }))
    const { container } = renderWithProviders(<StatusChange part={part} />)
    // The loader shows while the allowed statuses load; wait for it to go away.
    expect(container.querySelector('.mantine-Loader-root')).not.toBeNull()
    await waitFor(() => expect(container.querySelector('.mantine-Loader-root')).toBeNull())
    expect(screen.queryByRole('button', { name: 'Update status' })).not.toBeInTheDocument()
    expect(screen.queryByText(/locked/i)).not.toBeInTheDocument()
  })

  it('only enables saving once a status is chosen, then sends it', async () => {
    mockFetch((_url, init) =>
      init?.method === 'PUT'
        ? { status: 200, body: { ...part, status: 'deprecated' } }
        : { status: 200, body: allowed(['active', 'deprecated']) },
    )
    const user = userEvent.setup()
    renderWithProviders(<StatusChange part={part} />)

    await user.click(await screen.findByRole('button', { name: 'Update status' }))
    const save = await saveButton()
    expect(save).toBeDisabled()
    await user.click(await screen.findByPlaceholderText('Choose a new status'))
    await user.click(await screen.findByRole('option', { name: 'Deprecated', hidden: true }))
    expect(screen.getByText(/everywhere it is used/i)).toBeInTheDocument()
    expect(save).toBeEnabled()
    await user.click(save)

    await waitFor(() => {
      const put = vi.mocked(fetch).mock.calls.find(([, init]) => init?.method === 'PUT')
      expect(put?.[1]?.body).toBe(JSON.stringify({ status: 'deprecated' }))
    })
  })

  it('shows why when the part was removed (PUT 404)', async () => {
    mockFetch((_url, init) =>
      init?.method === 'PUT'
        ? { status: 404, body: { error: 'Part not found' } }
        : { status: 200, body: allowed(['active', 'deprecated']) },
    )
    const user = userEvent.setup()
    renderWithProviders(<><Notifications /><StatusChange part={part} /></>)

    await chooseDeprecated(user)
    await user.click(await saveButton())

    expect(await screen.findByText('Part not found')).toBeInTheDocument()
  })
})
