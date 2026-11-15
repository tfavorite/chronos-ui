import { Alert, Button } from '@mantine/core'
import type { ApiError } from '../api/client'

interface ErrorAlertProps {
  title: string
  error: ApiError
  onRetry?: () => void
  notFoundHint?: string // what to do when the item is gone; depends on where the alert appears
}

// 404 means the item is gone (someone removed it). Retrying cannot help, so don't offer it.
export function ErrorAlert({ title, error, onRetry, notFoundHint = 'It may have been removed.' }: ErrorAlertProps) {
  const gone = error.status === 404
  return (
    <Alert color="red" title={title}>
      {gone ? `${error.message.replace(/\.$/, '')}. ${notFoundHint}` : error.message}
      {!gone && onRetry && (
        <Button mt="xs" size="xs" display="flex" w="fit-content" onClick={onRetry}>Retry</Button>
      )}
    </Alert>
  )
}
