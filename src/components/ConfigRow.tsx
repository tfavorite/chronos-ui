import { Group, Text, UnstyledButton } from '@mantine/core'
import { usePart } from '../api/queries'
import type { Configuration } from '../api/types'
import { StatusBadge } from './StatusBadge'

interface ConfigRowProps {
  config: Configuration
  onOpen: (config: Configuration) => void
}

// One clickable configuration in a list. Opening it navigates into that configuration.
export function ConfigRow({ config, onOpen }: ConfigRowProps) {
  const part = usePart(config.partUuid)

  return (
    <UnstyledButton
      onClick={() => onOpen(config)}
      p="sm"
      style={{ border: '1px solid var(--mantine-color-gray-3)', borderRadius: 'var(--mantine-radius-sm)' }}
    >
      <Group wrap="nowrap" justify="space-between">
        <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
          {config.endUnitSerialNo && <Text fw={700}>SN {config.endUnitSerialNo}</Text>}
          {part.isPending && <Text c="dimmed">Loading…</Text>}
          {part.isError && <Text c="red">Could not load part</Text>}
          {part.data && (
            <>
              <Text ff="monospace" size="sm">{part.data.partNo}</Text>
              <Text truncate>{part.data.name}</Text>
              <Text c="dimmed" size="sm" style={{ whiteSpace: 'nowrap' }}>
                ×{config.quantity} {part.data.unit}
              </Text>
              <StatusBadge status={part.data.status} />
            </>
          )}
        </Group>
        <Text c="dimmed" aria-hidden>›</Text>
      </Group>
    </UnstyledButton>
  )
}
