import { Button, Group, Modal, Stack, Text, TextInput } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { useState } from 'react'
import { useUpdatePart } from '../api/queries'
import type { Part } from '../api/types'

export function UnitEdit({ part }: { part: Part }) {
  const update = useUpdatePart(part.uuid)
  const [unit, setUnit] = useState(part.unit)
  const [confirming, setConfirming] = useState(false)

  const trimmed = unit.trim()
  const changed = trimmed !== '' && trimmed !== part.unit

  function save() {
    update.mutate(
      { unit: trimmed },
      {
        onSuccess: () => {
          notifications.show({ color: 'green', title: 'Unit changed', message: `${part.partNo} now uses "${trimmed}".` })
          setConfirming(false)
        },
        onError: (error) => {
          notifications.show({ color: 'red', title: 'Unit not changed', message: error.message })
          setConfirming(false)
        },
      },
    )
  }

  return (
    <Group align="end">
      <TextInput
        label="Change unit to"
        w={200}
        value={unit}
        onChange={(event) => setUnit(event.currentTarget.value)}
        placeholder="e.g. pcs, set, m"
      />
      <Button variant="default" disabled={!changed} onClick={() => setConfirming(true)}>
        Change unit
      </Button>
      <Modal opened={confirming} onClose={() => setConfirming(false)} title="Confirm unit change">
        <Stack>
          <Text>
            Change the unit of {part.partNo} {part.name} from "{part.unit}" to "{trimmed}"?
          </Text>
          <Text size="sm" c="dimmed">
            This updates the part everywhere it is used, including other time machines.
          </Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setConfirming(false)}>Cancel</Button>
            <Button loading={update.isPending} onClick={save}>Change unit</Button>
          </Group>
        </Stack>
      </Modal>
    </Group>
  )
}
