import { Alert, Button, Loader, Stack, Text, TextInput, Title } from '@mantine/core'
import { useState } from 'react'
import { useChildConfigs, useRootConfigs } from '../api/queries'
import type { Configuration } from '../api/types'
import { ConfigRow } from './ConfigRow'
import { PartPanel } from './PartPanel'

interface ListState {
  configs: Configuration[] | undefined
  isPending: boolean
  error: Error | null
  refetch: () => void
}

function ConfigList({ state, empty, onOpen }: { state: ListState; empty: string; onOpen: (c: Configuration) => void }) {
  if (state.isPending) return <Loader />
  if (state.error) {
    return (
      <Alert color="red" title="Could not load configurations">
        {state.error.message}
        <Button mt="xs" size="xs" display="flex" w="fit-content" onClick={state.refetch}>Retry</Button>
      </Alert>
    )
  }
  if (!state.configs || state.configs.length === 0) return <Text c="dimmed">{empty}</Text>
  return (
    <Stack gap="xs">
      {state.configs.map((config) => (
        <ConfigRow key={config.uuid} config={config} onOpen={onOpen} />
      ))}
    </Stack>
  )
}

// Top level: all end units, filterable by serial number.
function EndUnits({ onOpen }: { onOpen: (c: Configuration) => void }) {
  const roots = useRootConfigs()
  const [filter, setFilter] = useState('')
  const configs = roots.data
    ?.filter((c) => (c.endUnitSerialNo ?? '').includes(filter.trim()))
    .sort((a, b) => (a.endUnitSerialNo ?? '').localeCompare(b.endUnitSerialNo ?? ''))

  return (
    <Stack>
      <Title order={3}>End units</Title>
      <TextInput
        label="Find end unit"
        placeholder="Serial number, e.g. 00007"
        value={filter}
        onChange={(event) => setFilter(event.currentTarget.value)}
      />
      <ConfigList
        state={{ configs, isPending: roots.isPending, error: roots.error, refetch: roots.refetch }}
        empty="No end units match."
        onOpen={onOpen}
      />
    </Stack>
  )
}

// One configuration: its part details, then the configurations directly beneath it.
function ConfigDetail({ config, machine, onOpen }: { config: Configuration; machine: Configuration; onOpen: (c: Configuration) => void }) {
  const children = useChildConfigs(config.uuid, true)

  return (
    <Stack gap="lg">
      <PartPanel config={config} machine={machine} />
      <Stack>
        <Title order={4}>Contains</Title>
        <ConfigList
          state={{ configs: children.data, isPending: children.isPending, error: children.error, refetch: children.refetch }}
          empty="Nothing below this configuration."
          onOpen={onOpen}
        />
      </Stack>
    </Stack>
  )
}

interface ConfigViewProps {
  path: Configuration[]
  onOpen: (c: Configuration) => void
}

export function ConfigView({ path, onOpen }: ConfigViewProps) {
  const current = path.at(-1)
  const machine = path[0]
  if (!current || !machine) return <EndUnits onOpen={onOpen} />
  return <ConfigDetail key={current.uuid} config={current} machine={machine} onOpen={onOpen} />
}
