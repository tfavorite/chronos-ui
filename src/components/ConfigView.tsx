import { Loader, Stack, Text, TextInput, Title } from '@mantine/core'
import { useState } from 'react'
import { useChildConfigs, useRootConfigs } from '../api/queries'
import type { ApiError } from '../api/client'
import type { Configuration } from '../api/types'
import { ErrorAlert } from './ErrorAlert'
import { ConfigRow } from './ConfigRow'
import { pathTo } from '../navigation/path'
import { PartPanel } from './PartPanel'

interface ListState {
  configs: Configuration[] | undefined
  isPending: boolean
  error: ApiError | null
  refetch: () => void
}

// `parentPath` is the route down to the configuration whose children are listed.
function ConfigList({ state, empty, parentPath }: { state: ListState; empty: string; parentPath: Configuration[] }) {
  if (state.isPending) return <Loader />
  if (state.error) {
    return (
      <ErrorAlert title="Could not load configurations" error={state.error} onRetry={state.refetch} notFoundHint="It may have been removed. Go back to the root configurations and start again." />
    )
  }
  if (!state.configs || state.configs.length === 0) return <Text c="dimmed">{empty}</Text>
  return (
    <Stack gap="xs">
      {state.configs.map((config) => (
        <ConfigRow key={config.uuid} config={config} href={pathTo([...parentPath, config])} />
      ))}
    </Stack>
  )
}

// Top level: all root configurations, filterable by serial number.
function RootConfigurations() {
  const roots = useRootConfigs()
  const [filter, setFilter] = useState('')
  const configs = roots.data
    ?.filter((c) => (c.endUnitSerialNo ?? '').includes(filter.trim()))
    .sort((a, b) => (a.endUnitSerialNo ?? '').localeCompare(b.endUnitSerialNo ?? ''))

  return (
    <Stack>
      <TextInput
        label="Find root configuration"
        placeholder="Serial number, e.g. 00007"
        value={filter}
        onChange={(event) => setFilter(event.currentTarget.value)}
      />
      <ConfigList
        state={{ configs, isPending: roots.isPending, error: roots.error, refetch: roots.refetch }}
        empty="No root configurations match."
        parentPath={[]}
      />
    </Stack>
  )
}

// One configuration: its part details, then the configurations directly beneath it.
function ConfigDetail({ config, machine, path }: { config: Configuration; machine: Configuration; path: Configuration[] }) {
  const children = useChildConfigs(config.uuid, true)
  // A leaf has nothing to list, so skip the section once we know that.
  const isLeaf = children.isSuccess && children.data.length === 0

  return (
    <Stack gap="lg">
      <PartPanel config={config} machine={machine} />
      {!isLeaf && (
        <Stack>
          <Title order={4}>Contains</Title>
          <ConfigList
            state={{ configs: children.data, isPending: children.isPending, error: children.error, refetch: children.refetch }}
            empty="Nothing below this configuration."
            parentPath={path}
          />
        </Stack>
      )}
    </Stack>
  )
}

// `path` is the route from the root configuration to the configuration being viewed ([] = the root list).
export function ConfigView({ path }: { path: Configuration[] }) {
  const current = path.at(-1)
  const machine = path[0]
  if (!current || !machine) return <RootConfigurations />
  return <ConfigDetail key={current.uuid} config={current} machine={machine} path={path} />
}
