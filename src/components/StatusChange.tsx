import { Anchor, Button, CheckIcon, Group, Loader, Modal, Select, Stack, Text } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { getAllowableStatusesFromError } from '../api/client'
import { queryKeys, useAllowedStatuses, useUpdatePart } from '../api/queries'
import { statusMeta } from '../api/statusMeta'
import type { AllowableStatuses, Part, PartStatus } from '../api/types'
import { selectableStatuses } from '../domain/status'

// Small inline control meant to sit next to the status badge:
// an "Update status" link. Renders nothing when the status is locked.
export function StatusChange({ part }: { part: Part }) {
  const queryClient = useQueryClient()
  const allowed = useAllowedStatuses(part.uuid)
  const update = useUpdatePart(part.uuid)
  const [opened, setOpened] = useState(false)
  const [target, setTarget] = useState<PartStatus | null>(null)

  if (allowed.isPending) return <Loader size="xs" />
  if (allowed.isError) {
    // A 404 means the part is gone, so retrying cannot help.
    return (
      <Text size="sm" c="red">
        Status options unavailable: {allowed.error.message}{' '}
        {allowed.error.status !== 404 && (
          <Anchor component="button" type="button" size="sm" onClick={() => allowed.refetch()}>Retry</Anchor>
        )}
      </Text>
    )
  }

  const options = selectableStatuses(part.status, allowed.data.allowableStatuses)
  if (options.length === 0) return null

  function open() {
    setTarget(null)
    setOpened(true)
  }

  function save() {
    if (!target) return
    update.mutate(
      { status: target },
      {
        onSuccess: () => {
          notifications.show({ color: 'green', title: 'Status changed', message: `${part.partNo} is now ${statusMeta[target].label}.` })
          setOpened(false)
        },
        onError: (error) => {
          notifications.show({ color: 'red', title: 'Status not changed', message: error.message })
          // The server told us what is really allowed; use it so the list is correct.
          const fresh = getAllowableStatusesFromError(error)
          if (fresh) {
            queryClient.setQueryData<AllowableStatuses>(queryKeys.allowed(part.uuid), (old) =>
              old ? { ...old, allowableStatuses: fresh } : old,
            )
          }
          setOpened(false)
        },
      },
    )
  }

  return (
    <>
      <Anchor component="button" type="button" size="sm" onClick={open}>
        Update status
      </Anchor>
      <Modal opened={opened} onClose={() => setOpened(false)} title={`Update status of ${part.partNo} ${part.name}`}>
        <Stack>
          <Select
            label="New status"
            description={`Currently ${statusMeta[part.status].label}`}
            placeholder="Choose a new status"
            data={options.map((status) => ({ value: status, label: statusMeta[status].label }))}
            value={target}
            onChange={(value) => setTarget(options.find((status) => status === value) ?? null)}
            allowDeselect={false}
            // Every option reserves room for the check mark, so the text doesn't move when one is selected.
            renderOption={({ option, checked }) => (
              <Group gap="xs" wrap="nowrap">
                <span style={{ width: 14, display: 'inline-flex', flexShrink: 0 }}>
                  {checked && <CheckIcon size={12} />}
                </span>
                {option.label}
              </Group>
            )}
            data-autofocus
          />
          <Text size="sm" c="dimmed">
            This updates the part everywhere it is used, including other time machines.
          </Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setOpened(false)}>Cancel</Button>
            <Button disabled={!target} loading={update.isPending} onClick={save}>Update status</Button>
          </Group>
        </Stack>
      </Modal>
    </>
  )
}
