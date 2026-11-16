import { Anchor, Breadcrumbs, Button, List, Text } from '@mantine/core'
import { useState } from 'react'
import { useMachineTree, usePart } from '../api/queries'
import type { Configuration, Part } from '../api/types'
import { countPartUsages, findPartPaths, totalQuantity } from '../domain/tree'
import { ErrorAlert } from './ErrorAlert'
import { pathTo } from '../navigation/path'

interface PartUsageProps {
  part: Part
  current: Configuration // the configuration being viewed
  machine: Configuration // the root configuration (machine) we are inside
}

function PartName({ uuid }: { uuid: string }) {
  const part = usePart(uuid)
  return <>{part.data?.name ?? '…'}</>
}

// "Machine / Safety System / Power Cell (×1)", the same look as the page breadcrumb.
// Every name links to that level of the hierarchy.
function UsageLink({ route }: { route: Configuration[] }) {
  return (
    <Breadcrumbs separatorMargin="xs">
      {route.map((config, index) => (
        <span key={config.uuid}>
          <Anchor href={pathTo(route.slice(0, index + 1))}>
            <PartName uuid={config.partUuid} />
          </Anchor>
          {index === route.length - 1 && ` (×${config.quantity})`}
        </span>
      ))}
    </Breadcrumbs>
  )
}

export function PartUsage({ part, current, machine }: PartUsageProps) {
  const [requested, setRequested] = useState(false)
  const tree = useMachineTree(machine, requested)

  // Idle with no data: nothing has been fetched for this machine yet, so ask first.
  if (tree.isPending && tree.fetchStatus === 'idle') {
    return (
      <Button variant="light" size="xs" w="fit-content" onClick={() => setRequested(true)}>
        Where else is this part used?
      </Button>
    )
  }
  if (tree.isPending) return <Text size="sm" c="dimmed">Scanning machine…</Text>
  if (tree.isError) {
    return (
      <ErrorAlert title="Could not scan the machine" error={tree.error} onRetry={() => tree.refetch()} />
    )
  }

  const uses = countPartUsages(tree.data, part.uuid)
  const total = totalQuantity(tree.data, part.uuid)
  const others = findPartPaths(tree.data, part.uuid).filter((route) => route.at(-1)?.uuid !== current.uuid)

  // Nowhere else: skip the summary line, it would only repeat the one place we are already viewing.
  if (others.length === 0) {
    return <Text size="sm" c="dimmed">There are no other uses besides in {part.partNo}</Text>
  }

  return (
    <div>
      <Text size="sm" fw={600}>
        {part.partNo} is used in {uses} places in this machine ({total} {part.unit} in total); here, and:
      </Text>
      <List size="sm" mt={4}>
        {others.map((route) => (
          <List.Item key={route.at(-1)?.uuid}>
            <UsageLink route={route} />
          </List.Item>
        ))}
      </List>
    </div>
  )
}
