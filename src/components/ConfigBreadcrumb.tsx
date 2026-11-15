import { Anchor, Breadcrumbs, Text } from '@mantine/core'
import { usePart } from '../api/queries'
import type { Configuration } from '../api/types'
import { pathTo } from '../navigation/path'

function crumbLabel(config: Configuration, partName: string | undefined): string {
  const name = partName ?? '…'
  return config.endUnitSerialNo ? `SN ${config.endUnitSerialNo} · ${name}` : name
}

function Crumb({ config, href, isLast }: { config: Configuration; href: string; isLast: boolean }) {
  const part = usePart(config.partUuid)
  const label = crumbLabel(config, part.data?.name)
  if (isLast) return <Text fw={600}>{label}</Text>
  return <Anchor href={href}>{label}</Anchor>
}

export function ConfigBreadcrumb({ path }: { path: Configuration[] }) {
  return (
    <Breadcrumbs>
      {path.length === 0 ? (
        <Text fw={600}>Root configurations</Text>
      ) : (
        <Anchor href={pathTo([])}>Root configurations</Anchor>
      )}
      {path.map((config, index) => (
        <Crumb
          key={config.uuid}
          config={config}
          href={pathTo(path.slice(0, index + 1))}
          isLast={index === path.length - 1}
        />
      ))}
    </Breadcrumbs>
  )
}
