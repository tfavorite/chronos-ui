import { Alert, Anchor, Button, List, Text } from '@mantine/core'
import { useState } from 'react'
import { useMachineTree, usePart } from '../api/queries'
import type { Configuration, Part } from '../api/types'
import { countPartUsages, findPartPaths, totalQuantity } from '../domain/tree'
import { formatPath } from '../navigation/path'

interface PartUsageProps {
  part: Part
  current: Configuration // the configuration being viewed
  machine: Configuration // the end unit we are inside
}

function PartName({ uuid }: { uuid: string }) {
  const part = usePart(uuid)
  return <>{part.data?.name ?? '…'}</>
}

// "Machine › Safety System › Power Cell", linking to that configuration.
function UsageLink({ route }: { route: Configuration[] }) {
  const last = route.at(-1)
  return (
    <Anchor href={formatPath(route.map((config) => config.uuid))}>
      {route.map((config, index) => (
        <span key={config.uuid}>
          {index > 0 && ' › '}
          <PartName uuid={config.partUuid} />
        </span>
      ))}
      {last && ` (×${last.quantity})`}
    </Anchor>
  )
}

export function PartUsage({ part, current, machine }: PartUsageProps) {
  const [requested, setRequested] = useState(false)
  const tree = useMachineTree(machine, requested)

  if (!requested) {
    return (
      <Button variant="light" size="xs" w="fit-content" onClick={() => setRequested(true)}>
        Where else is this part used?
      </Button>
    )
  }
  if (tree.isPending) return <Text size="sm" c="dimmed">Scanning machine…</Text>
  if (tree.isError) {
    return (
      <Alert color="red" title="Could not scan the machine">
        {tree.error.message}
        <Button mt="xs" size="xs" display="flex" w="fit-content" onClick={() => tree.refetch()}>Retry</Button>
      </Alert>
    )
  }

  const uses = countPartUsages(tree.data, part.uuid)
  const total = totalQuantity(tree.data, part.uuid)
  const others = findPartPaths(tree.data, part.uuid).filter((route) => route.at(-1)?.uuid !== current.uuid)

  return (
    <div>
      <Text size="sm" fw={600}>
        {part.partNo} is used in {uses} place{uses === 1 ? '' : 's'} in this machine ({total} {part.unit} in total).
      </Text>
      {others.length === 0 ? (
        <Text size="sm" c="dimmed">There are no other uses in this machine.</Text>
      ) : (
        <List size="sm" mt={4}>
          {others.map((route) => (
            <List.Item key={route.at(-1)?.uuid}>
              <UsageLink route={route} />
            </List.Item>
          ))}
        </List>
      )}
    </div>
  )
}
