import type { PartStatus } from '../api/types'

// The API's `allowableStatuses` usually includes the current status, which is not a change.
// An empty result means the part's status is locked.
export function selectableStatuses(current: PartStatus, allowed: PartStatus[]): PartStatus[] {
  return allowed.filter((status) => status !== current)
}
