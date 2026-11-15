import { Badge } from '@mantine/core'
import { statusMeta } from '../api/statusMeta'
import type { PartStatus } from '../api/types'

export function StatusBadge({ status }: { status: PartStatus }) {
  const meta = statusMeta[status]
  return (
    <Badge color={meta.color} variant="light">
      {meta.label}
    </Badge>
  )
}
