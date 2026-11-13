import { Alert, Button, Group, Loader, Paper, Stack, Text, Title } from '@mantine/core'
import { usePart } from '../api/queries'
import type { Configuration } from '../api/types'
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
      <Alert color="red" title="Could not load part">
        {part.error.message}
        <Button mt="xs" size="xs" display="flex" w="fit-content" onClick={() => part.refetch()}>Retry</Button>
      </Alert>
    )
  }

  const { data } = part
  return (
    <Paper withBorder p="md">
      <Stack gap="xs">
        <Title order={3}>{data.partNo} · {data.name}</Title>
        <Group>
          <Text fw={600}>Status</Text>
          <StatusBadge status={data.status} />
        </Group>
        <Group>
          <Text fw={600}>Unit</Text>
          <Text>{data.unit}</Text>
        </Group>
        <Group>
          <Text fw={600}>Quantity in this configuration</Text>
          <Text>{config.quantity} {data.unit}</Text>
        </Group>
        <StatusChange part={data} />
        <UnitEdit key={data.unit} part={data} />
        <PartUsage part={data} current={config} machine={machine} />
        <Text size="sm" c="dimmed">
          The part is shared: changes to it apply to every configuration that uses it.
        </Text>
      </Stack>
    </Paper>
  )
}
