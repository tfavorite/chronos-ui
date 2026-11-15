import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useResolvedPath } from './useConfigPath'

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

function mockChildren(byParent: Record<string, unknown[]>) {
  vi.stubGlobal(
    'fetch',
    vi.fn((url: string) => {
      const parent = new URL(url).searchParams.get('parentUuid') ?? 'root'
      return Promise.resolve({ ok: true, status: 200, text: () => Promise.resolve(JSON.stringify(byParent[parent] ?? [])) })
    }),
  )
}

afterEach(() => vi.unstubAllGlobals())

describe('useResolvedPath', () => {
  it('resolves each uuid from its parent list', async () => {
    mockChildren({
      root: [{ uuid: 'a', partUuid: 'p', quantity: 1, endUnitSerialNo: '1' }],
      a: [{ uuid: 'b', partUuid: 'q', quantity: 2 }],
    })
    const { result } = renderHook(() => useResolvedPath(['a', 'b']), { wrapper })
    await waitFor(() => expect(result.current.status).toBe('ready'))
    expect(result.current.path.map((c) => c.uuid)).toEqual(['a', 'b'])
  })

  it('reports not-found for an unknown uuid', async () => {
    mockChildren({ root: [] })
    const { result } = renderHook(() => useResolvedPath(['nope']), { wrapper })
    await waitFor(() => expect(result.current.status).toBe('not-found'))
  })

  it('is ready with an empty path at the root list', () => {
    const { result } = renderHook(() => useResolvedPath([]), { wrapper })
    expect(result.current).toEqual({ status: 'ready', path: [] })
  })
})
