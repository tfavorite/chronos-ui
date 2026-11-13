import { Anchor, Breadcrumbs, Text } from '@mantine/core'
import { usePart } from '../api/queries'
import type { Configuration } from '../api/types'

function crumbLabel(config: Configuration, partName: string | undefined): string {
  const name = partName ?? '…'
  return config.endUnitSerialNo ? `SN ${config.endUnitSerialNo} · ${name}` : name
}

function Crumb({ config, isLast, onClick }: { config: Configuration; isLast: boolean; onClick: () => void }) {
  const part = usePart(config.partUuid)
  const label = crumbLabel(config, part.data?.name)
  if (isLast) return <Text fw={600}>{label}</Text>
  return <Anchor component="button" type="button" onClick={onClick}>{label}</Anchor>
}

interface ConfigBreadcrumbProps {
  path: Configuration[]
  onNavigate: (depth: number) => void // depth 0 = the end unit list
}

export function ConfigBreadcrumb({ path, onNavigate }: ConfigBreadcrumbProps) {
  return (
    <Breadcrumbs>
      {path.length === 0 ? (
        <Text fw={600}>End units</Text>
      ) : (
        <Anchor component="button" type="button" onClick={() => onNavigate(0)}>End units</Anchor>
      )}
      {path.map((config, index) => (
        <Crumb
          key={config.uuid}
          config={config}
          isLast={index === path.length - 1}
          onClick={() => onNavigate(index + 1)}
        />
      ))}
    </Breadcrumbs>
  )
}
