import type { PartStatus } from './types'

interface StatusMeta {
  label: string
  color: string
  description: string
}

export const statusMeta: Record<PartStatus, StatusMeta> = {
  configuration: { label: 'Configuration', color: 'blue', description: 'Part is a container for a configured assembly.' },
  active: { label: 'Active', color: 'green', description: 'In production and approved for use.' },
  draft: { label: 'Draft', color: 'gray', description: 'Still being defined. Not yet approved.' },
  deprecated: { label: 'Deprecated', color: 'yellow', description: 'Still in use, but being phased out.' },
  obsolete: { label: 'Obsolete', color: 'orange', description: 'No longer to be used in new builds.' },
  experimental: { label: 'Experimental', color: 'violet', description: 'Being tested. Not for production.' },
  retired: { label: 'Retired', color: 'dark', description: 'Taken out of service.' },
  recalled: { label: 'Recalled', color: 'red', description: 'Withdrawn due to a problem. Do not use.' },
}
