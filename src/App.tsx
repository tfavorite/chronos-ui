import { Alert, AppShell, Button, Container, Group, Loader, Stack, Title } from '@mantine/core'
import { ConfigBreadcrumb } from './components/ConfigBreadcrumb'
import { HealthBanner } from './components/HealthBanner'
import { ConfigView } from './components/ConfigView'
import { navigateTo, useHashUuids, useResolvedPath } from './navigation/useConfigPath'

export default function App() {
  // Position in the hierarchy comes from the URL, not component state.
  const uuids = useHashUuids()
  const resolved = useResolvedPath(uuids)

  return (
    <AppShell header={{ height: 56 }} padding="md">
      <AppShell.Header>
        <Group h="100%" px="md">
          <Title order={4}>Chronos Temporal Control</Title>
        </Group>
      </AppShell.Header>
      <AppShell.Main>
        <Container size="md">
          <HealthBanner />
          {resolved.status === 'pending' && <Loader />}
          {(resolved.status === 'error' || resolved.status === 'not-found') && (
            <Alert color="red" title="Cannot open this location">
              {resolved.error?.message ?? 'This configuration no longer exists.'}
              <Button mt="xs" size="xs" display="flex" w="fit-content" onClick={() => navigateTo([])}>Back to end units</Button>
            </Alert>
          )}
          {resolved.status === 'ready' && (
            <Stack>
              <ConfigBreadcrumb path={resolved.path} onNavigate={(depth) => navigateTo(uuids.slice(0, depth))} />
              <ConfigView path={resolved.path} onOpen={(config) => navigateTo([...uuids, config.uuid])} />
            </Stack>
          )}
        </Container>
      </AppShell.Main>
    </AppShell>
  )
}
