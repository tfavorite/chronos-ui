import { Badge, Tooltip } from '@mantine/core'
import { statusMeta } from '../api/statusMeta'
import type { PartStatus } from '../api/types'

export function StatusBadge({ status }: { status: PartStatus }) {
  const meta = statusMeta[status]
  return (
    <Tooltip label={meta.description} withArrow>
      <Badge color={meta.color} variant="light">
        {meta.label}
      </Badge>
    </Tooltip>
  )
}
