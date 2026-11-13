import { Alert } from '@mantine/core'
import { useHealth } from '../api/queries'

export function HealthBanner() {
  const health = useHealth()
  if (!health.isError) return null
  const keyRejected = health.error.status === 403
  return (
    <Alert color="orange" title={keyRejected ? 'Access denied' : 'Server unreachable'} mb="md">
      {keyRejected
        ? 'The API key was rejected. Check CHRONOS_API_KEY.'
        : 'Cannot reach the configuration service. Data shown may be out of date.'}
    </Alert>
  )
}
