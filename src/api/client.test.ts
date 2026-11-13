import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiError, request } from './client'

function mockFetch(status: number, body: unknown) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({ ok: status < 400, status, json: () => Promise.resolve(body) }),
  )
}

afterEach(() => vi.unstubAllGlobals())

describe('request', () => {
  it('returns parsed JSON on success', async () => {
    mockFetch(200, { ok: true })
    expect(await request('/x')).toEqual({ ok: true })
  })

  it('normalizes {error: string}', async () => {
    mockFetch(404, { error: 'Part not found' })
    await expect(request('/x')).rejects.toMatchObject({ status: 404, message: 'Part not found' })
  })

  it('normalizes {message}', async () => {
    mockFetch(403, { message: 'Forbidden' })
    await expect(request('/x')).rejects.toMatchObject({ status: 403, message: 'Forbidden' })
  })

  it('normalizes the Zod {error: {message}} shape', async () => {
    mockFetch(400, { success: false, error: { name: 'ZodError', message: 'Invalid uuid' } })
    await expect(request('/x')).rejects.toMatchObject({ status: 400, message: 'Invalid uuid' })
  })

  it('keeps allowableStatuses from an invalid status change', async () => {
    mockFetch(400, { error: 'Invalid status change', allowableStatuses: ['active'] })
    await expect(request('/x')).rejects.toMatchObject({ allowableStatuses: ['active'] })
  })

  it('maps network failure to status 0', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('failed')))
    const error = await request('/x').catch((e: unknown) => e)
    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ status: 0 })
  })
})
