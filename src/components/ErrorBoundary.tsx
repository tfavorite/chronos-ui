import { Alert, Button } from '@mantine/core'
import { Component } from 'react'
import type { ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  failed: boolean
}

// Catches rendering crashes anywhere below it so the technician sees a message, not a blank page.
// Error boundaries must be class components; React has no hook for this.
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { failed: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { failed: true }
  }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <Alert color="red" title="Something went wrong" m="md">
        The interface hit an unexpected problem. No changes were made.
        <Button mt="xs" size="xs" display="flex" w="fit-content" onClick={() => window.location.reload()}>Reload</Button>
      </Alert>
    )
  }
}
