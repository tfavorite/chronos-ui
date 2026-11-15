import { Alert, AppShell, Button, Container, Group, Loader, Stack, Title } from '@mantine/core'
import { ConfigBreadcrumb } from './components/ConfigBreadcrumb'
import { FluxCapacitorIcon } from './components/FluxCapacitorIcon'
import { HealthBanner } from './components/HealthBanner'
import { ConfigView } from './components/ConfigView'
import { pathTo } from './navigation/path'
import { useHashUuids, useResolvedPath } from './navigation/useConfigPath'

export default function App() {
  // Position in the hierarchy comes from the URL, not component state.
  const uuids = useHashUuids()
  const resolved = useResolvedPath(uuids)

  return (
    <AppShell header={{ height: 56 }} padding="md">
      <AppShell.Header>
        <Group h="100%" px="md" gap="xs">
          <FluxCapacitorIcon size={26} />
          <Title order={4}>Chronos Temporal Control Interface</Title>
        </Group>
      </AppShell.Header>
      <AppShell.Main>
        <Container size="md" ml={0}>
          <HealthBanner />
          {resolved.status === 'pending' && <Loader />}
          {(resolved.status === 'error' || resolved.status === 'not-found') && (
            <Alert color="red" title="Cannot open this location">
              {resolved.error?.message ?? 'This configuration no longer exists.'}
              <Button component="a" href={pathTo([])} mt="xs" size="xs" display="flex" w="fit-content">Back to root configurations</Button>
            </Alert>
          )}
          {resolved.status === 'ready' && (
            <Stack>
              <ConfigBreadcrumb path={resolved.path} />
              <ConfigView path={resolved.path} />
            </Stack>
          )}
        </Container>
      </AppShell.Main>
    </AppShell>
  )
}
