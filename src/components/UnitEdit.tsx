import { Anchor, Button, Group, Modal, Stack, Text, TextInput } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { useState } from 'react'
import { useUpdatePart } from '../api/queries'
import type { Part } from '../api/types'

// A small "Change unit" link that opens a modal. Meant to sit next to the quantity.
export function UnitEdit({ part }: { part: Part }) {
  const update = useUpdatePart(part.uuid)
  const [opened, setOpened] = useState(false)
  const [unit, setUnit] = useState(part.unit)

  const trimmed = unit.trim()
  const changed = trimmed !== '' && trimmed !== part.unit

  function open() {
    setUnit(part.unit)
    setOpened(true)
  }

  function save() {
    update.mutate(
      { unit: trimmed },
      {
        onSuccess: () => {
          notifications.show({ color: 'green', title: 'Unit changed', message: `${part.partNo} now uses "${trimmed}".` })
          setOpened(false)
        },
        onError: (error) => {
          notifications.show({ color: 'red', title: 'Unit not changed', message: error.message })
          setOpened(false)
        },
      },
    )
  }

  return (
    <>
      <Anchor component="button" type="button" size="sm" onClick={open}>
        Change unit
      </Anchor>
      <Modal opened={opened} onClose={() => setOpened(false)} title={`Change unit for ${part.partNo} ${part.name}`}>
        <Stack>
          <TextInput
            label="Unit"
            description={`Currently "${part.unit}"`}
            placeholder="e.g. pcs, set, m"
            value={unit}
            onChange={(event) => setUnit(event.currentTarget.value)}
            data-autofocus
          />
          <Text size="sm" c="dimmed">
            This updates the part everywhere it is used, including other time machines.
          </Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setOpened(false)}>Cancel</Button>
            <Button disabled={!changed} loading={update.isPending} onClick={save}>Change unit</Button>
          </Group>
        </Stack>
      </Modal>
    </>
  )
}
