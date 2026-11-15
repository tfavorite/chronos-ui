import type { AllowableStatuses, Configuration, Part, PartStatus, UpdatePartBody } from './types'

export class ApiError extends Error {
  status: number
  body: unknown // the parsed response body, for callers that need endpoint-specific fields

  constructor(status: number, message: string, body: unknown = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

// The API reports errors in several shapes: {error: string}, {message: string}, a Zod object
// {error: {name: 'ZodError', message: <JSON dump>}}, and sometimes plain text.
// Reduce them to one message that is safe to show a technician.
function extractMessage(status: number, body: unknown): string {
  if (status === 403) return 'Access denied. The API key is missing or was rejected.'
  if (status >= 500) return 'The server had a problem. Please try again.'

  if (typeof body === 'string' && body.trim() !== '') return body
  if (typeof body === 'object' && body !== null) {
    const { error, message } = body as { error?: unknown; message?: unknown }
    if (typeof error === 'string') return error
    // Zod messages are a raw JSON dump meant for developers, so don't show them.
    if (typeof error === 'object' && error !== null) return 'The request was not accepted: some input was invalid.'
    if (typeof message === 'string') return message
  }
  return `Request failed (${status})`
}

export async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${import.meta.env.CHRONOS_API_URL}${path}`, {
      ...init,
      headers: {
        // Only requests with a body need a content type.
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
        'x-api-key': import.meta.env.CHRONOS_API_KEY,
        ...init.headers,
      },
    })
  } catch {
    throw new ApiError(0, 'Cannot reach the server. Check your connection and try again.')
  }

  // Bodies are normally JSON, but some errors are plain text and some responses are empty.
  const text = await response.text().catch(() => '')
  let body: unknown = text === '' ? null : text
  try {
    body = JSON.parse(text)
  } catch {
    // keep the plain text (or null when empty)
  }

  if (!response.ok) {
    throw new ApiError(response.status, extractMessage(response.status, body), body)
  }
  return body as T
}

// Omitting parentUuid returns the root configurations.
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

// A rejected status change (400) includes the statuses the server would have accepted.
export function getAllowableStatusesFromError(error: ApiError): PartStatus[] | undefined {
  if (typeof error.body !== 'object' || error.body === null) return undefined
  const { allowableStatuses } = error.body as { allowableStatuses?: unknown }
  return Array.isArray(allowableStatuses) ? (allowableStatuses as PartStatus[]) : undefined
}
