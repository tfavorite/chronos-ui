import type { AllowableStatuses, Configuration, Part, PartStatus, UpdatePartBody } from './types'

export class ApiError extends Error {
  status: number
  allowableStatuses?: PartStatus[]

  constructor(status: number, message: string, allowableStatuses?: PartStatus[]) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.allowableStatuses = allowableStatuses
  }
}

// The API reports errors in three shapes: {error: string}, {message: string},
// and a Zod object {error: {message: string}}. Reduce them to one string.
function extractMessage(body: unknown, fallback: string): string {
  if (typeof body !== 'object' || body === null) return fallback
  const { error, message } = body as { error?: unknown; message?: unknown }
  if (typeof error === 'string') return error
  if (typeof error === 'object' && error !== null) {
    const nested = (error as { message?: unknown }).message
    if (typeof nested === 'string') return nested
  }
  if (typeof message === 'string') return message
  return fallback
}

export async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${import.meta.env.CHRONOS_API_URL}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': import.meta.env.CHRONOS_API_KEY,
        ...init.headers,
      },
    })
  } catch {
    throw new ApiError(0, 'Cannot reach the server. Check your connection and try again.')
  }

  // Error bodies and successful bodies are both JSON, but guard against empty/invalid ones.
  let body: unknown = null
  try {
    body = await response.json()
  } catch {
    body = null
  }

  if (!response.ok) {
    const allowable = (body as { allowableStatuses?: PartStatus[] } | null)?.allowableStatuses
    throw new ApiError(
      response.status,
      extractMessage(body, `Request failed (${response.status})`),
      Array.isArray(allowable) ? allowable : undefined,
    )
  }
  return body as T
}

// Omitting parentUuid returns the root configurations (end units).
export function getChildConfigs(parentUuid?: string): Promise<Configuration[]> {
  const query = parentUuid ? `?parentUuid=${encodeURIComponent(parentUuid)}` : ''
  return request<Configuration[]>(`/api/configs/children${query}`)
}

export function getRootConfigs(): Promise<Configuration[]> {
  return getChildConfigs()
}

export function getPart(uuid: string): Promise<Part> {
  return request<Part>(`/api/parts/${encodeURIComponent(uuid)}`)
}

export function getAllowedStatuses(uuid: string): Promise<AllowableStatuses> {
  return request<AllowableStatuses>(`/api/parts/${encodeURIComponent(uuid)}/allowable-statuses`)
}

export function updatePart(uuid: string, body: UpdatePartBody): Promise<Part> {
  return request<Part>(`/api/parts/${encodeURIComponent(uuid)}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
}

export function getHealth(): Promise<{ status: string; message: string }> {
  return request('/api/health')
}
