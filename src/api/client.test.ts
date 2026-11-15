import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiError, getAllowableStatusesFromError, request } from './client'

function mockFetch(status: number, body: unknown) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({ ok: status < 400, status, text: () => Promise.resolve(typeof body === 'string' ? body : JSON.stringify(body)) }),
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

  it('explains a 403 in plain language', async () => {
    mockFetch(403, { message: 'Forbidden' })
    await expect(request('/x')).rejects.toMatchObject({ status: 403, message: expect.stringContaining('API key') })
  })

  it('normalizes {message}', async () => {
    mockFetch(409, { message: 'Conflict happened' })
    await expect(request('/x')).rejects.toMatchObject({ status: 409, message: 'Conflict happened' })
  })

  it('uses a plain-text error body', async () => {
    mockFetch(400, 'Malformed JSON in request body')
    await expect(request('/x')).rejects.toMatchObject({ status: 400, message: 'Malformed JSON in request body' })
  })

  it('hides server error details', async () => {
    mockFetch(500, { error: 'stack trace here' })
    await expect(request('/x')).rejects.toMatchObject({ status: 500, message: expect.stringContaining('server had a problem') })
  })

  it('returns null for an empty success body', async () => {
    mockFetch(204, '')
    expect(await request('/x')).toBeNull()
  })

  it('falls back when an error body is empty', async () => {
    mockFetch(418, '')
    await expect(request('/x')).rejects.toMatchObject({ status: 418, message: 'Request failed (418)' })
  })

  it('does not show raw Zod output', async () => {
    mockFetch(400, { success: false, error: { name: 'ZodError', message: '[ { "code": "invalid_format" } ]' } })
    const error = await request('/x').catch((e: unknown) => e)
    expect(error).toMatchObject({ status: 400, message: 'The request was not accepted: some input was invalid.' })
  })

  it('keeps the response body on the error', async () => {
    mockFetch(400, { error: 'Invalid status change', allowableStatuses: ['active'] })
    const error = await request('/x').catch((e: unknown) => e)
    expect(error).toBeInstanceOf(ApiError)
    expect(getAllowableStatusesFromError(error as ApiError)).toEqual(['active'])
  })

  it('has no allowable statuses when the body lacks them', () => {
    expect(getAllowableStatusesFromError(new ApiError(404, 'Part not found', { error: 'Part not found' }))).toBeUndefined()
    expect(getAllowableStatusesFromError(new ApiError(400, 'bad', 'plain text'))).toBeUndefined()
    expect(getAllowableStatusesFromError(new ApiError(0, 'offline'))).toBeUndefined()
  })

  it('maps network failure to status 0', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('failed')))
    const error = await request('/x').catch((e: unknown) => e)
    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ status: 0 })
  })
})
