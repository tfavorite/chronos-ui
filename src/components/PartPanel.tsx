import { Group, Loader, Paper, Stack, Text, Title } from '@mantine/core'
import { usePart } from '../api/queries'
import type { Configuration } from '../api/types'
import { isFeatureEnabled } from '../features'
import { ErrorAlert } from './ErrorAlert'
import { PartUsage } from './PartUsage'
import { StatusChange } from './StatusChange'
import { StatusBadge } from './StatusBadge'
import { UnitEdit } from './UnitEdit'

// Details of the part a configuration references.
interface PartPanelProps {
  config: Configuration
  machine: Configuration
}

export function PartPanel({ config, machine }: PartPanelProps) {
  const part = usePart(config.partUuid)

  if (part.isPending) return <Loader />
  if (part.isError) {
    return (
      <ErrorAlert title="Could not load part" error={part.error} onRetry={() => part.refetch()} notFoundHint="It may have been removed. Go back to the root configurations and start again." />
    )
  }

  const { data } = part
  return (
    <Paper withBorder p="md">
      <Stack gap="xs">
        <Group gap="sm">
          <Title order={3}>{data.partNo} · {data.name}</Title>
          <StatusBadge status={data.status} />
          <StatusChange part={data} />
        </Group>
        <Group>
          <Text fw={600}>Quantity</Text>
          <Text>{config.quantity} {data.unit}</Text>
          <UnitEdit part={data} />
        </Group>
        {isFeatureEnabled('usage') && <PartUsage part={data} current={config} machine={machine} />}
      </Stack>
    </Paper>
  )
}
