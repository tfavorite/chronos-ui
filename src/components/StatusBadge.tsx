import { Badge } from '@mantine/core'
import { getStatusMetadata } from '../api/statusMeta'
import type { PartStatus } from '../api/types'

export function StatusBadge({ status }: { status: PartStatus }) {
  const meta = getStatusMetadata(status)
  return (
    <Badge color={meta.color} variant="light">
      {meta.label}
    </Badge>
  )
}
