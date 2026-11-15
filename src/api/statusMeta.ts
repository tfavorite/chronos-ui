import type { PartStatus } from './types'

interface PartStatusMetadata {
  label: string
  color: string
}

export const statusMeta: Record<PartStatus, PartStatusMetadata> = {
  configuration: { label: 'Configuration', color: 'blue' },
  active: { label: 'Active', color: 'green' },
  draft: { label: 'Draft', color: 'gray' },
  deprecated: { label: 'Deprecated', color: 'yellow' },
  obsolete: { label: 'Obsolete', color: 'orange' },
  experimental: { label: 'Experimental', color: 'violet' },
  retired: { label: 'Retired', color: 'dark' },
  recalled: { label: 'Recalled', color: 'red' },
}

// The type says every status has an entry, but the server could send one we don't know about
// (types are erased at runtime). Fall back to a neutral badge showing the raw text.
export function getStatusMetadata(status: PartStatus): PartStatusMetadata {
  return statusMeta[status] ?? { label: status, color: 'gray' }
}
