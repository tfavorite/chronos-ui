import { Button, Group, Loader, Modal, Select, Stack, Text } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { queryKeys, useAllowedStatuses, useUpdatePart } from '../api/queries'
import { statusMeta } from '../api/statusMeta'
import type { AllowableStatuses, Part, PartStatus } from '../api/types'
import { selectableStatuses } from '../domain/status'

export function StatusChange({ part }: { part: Part }) {
  const queryClient = useQueryClient()
  const allowed = useAllowedStatuses(part.uuid)
  const update = useUpdatePart(part.uuid)
  const [target, setTarget] = useState<PartStatus | null>(null)

  if (allowed.isPending) return <Loader size="sm" />
  if (allowed.isError) {
    return (
      <Group>
        <Text size="sm" c="red">Could not load allowed changes: {allowed.error.message}</Text>
        <Button size="compact-xs" variant="subtle" onClick={() => allowed.refetch()}>Retry</Button>
      </Group>
    )
  }

  const options = selectableStatuses(part.status, allowed.data.allowableStatuses)
  if (options.length === 0) return <Text size="sm">This part's status is locked and cannot be changed.</Text>

  function confirm() {
    if (!target) return
    update.mutate(
      { status: target },
      {
        onSuccess: () => {
          notifications.show({ color: 'green', title: 'Status changed', message: `${part.partNo} is now ${statusMeta[target].label}.` })
          setTarget(null)
        },
        onError: (error) => {
          notifications.show({ color: 'red', title: 'Status not changed', message: error.message })
          // The server told us what is really allowed; use it so the buttons are correct.
          if (error.allowableStatuses) {
            const fresh = error.allowableStatuses
            queryClient.setQueryData<AllowableStatuses>(queryKeys.allowed(part.uuid), (old) =>
              old ? { ...old, allowableStatuses: fresh } : old,
            )
          }
          setTarget(null)
        },
      },
    )
  }

  return (
    <Group>
      <Text fw={600}>Change status to</Text>
      <Select
        aria-label="Change status to"
        w={200}
        placeholder="Choose a new status"
        data={options.map((status) => ({ value: status, label: statusMeta[status].label }))}
        value={null}
        onChange={(value) => {
          const chosen = options.find((status) => status === value)
          if (chosen) setTarget(chosen)
        }}
        allowDeselect={false}
      />
      <Modal opened={target !== null} onClose={() => setTarget(null)} title="Confirm status change">
        {target && (
          <Stack>
            <Text>
              Change {part.partNo} {part.name} from {statusMeta[part.status].label} to {statusMeta[target].label}?
            </Text>
            <Text size="sm" c="dimmed">
              This updates the part everywhere it is used, including other time machines.
            </Text>
            <Group justify="flex-end">
              <Button variant="default" onClick={() => setTarget(null)}>Cancel</Button>
              <Button loading={update.isPending} onClick={confirm}>Change status</Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </Group>
  )
}
