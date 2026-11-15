import { useQueries } from '@tanstack/react-query'
import { useMemo, useSyncExternalStore } from 'react'
import { getChildConfigs } from '../api/client'
import { queryKeys } from '../api/queries'
import type { Configuration } from '../api/types'
import { parsePath } from './path'

function subscribe(onChange: () => void): () => void {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}

// Reads the URL hash and re-renders when it changes (back/forward, link clicks).
export function useHashUuids(): string[] {
  const hash = useSyncExternalStore(subscribe, () => window.location.hash)
  return useMemo(() => parsePath(hash), [hash])
}

interface ResolvedPath {
  status: 'pending' | 'ready' | 'error' | 'not-found'
  path: Configuration[]
  error?: Error
}

// The URL only has UUIDs, and the API cannot fetch a configuration by UUID.
// So each UUID is looked up in its parent's child list. These are the same cached
// queries the lists use, and the parents are known up front, so they load in parallel.
export function useResolvedPath(uuids: string[]): ResolvedPath {
  const results = useQueries({
    queries: uuids.map((_, index) => {
      const parentUuid = index === 0 ? undefined : uuids[index - 1]
      return {
        queryKey: parentUuid ? queryKeys.children(parentUuid) : queryKeys.roots,
        queryFn: () => getChildConfigs(parentUuid),
        staleTime: 5 * 60 * 1000,
      }
    }),
  })

  const path: Configuration[] = []
  for (const [index, result] of results.entries()) {
    if (result.error) return { status: 'error', path: [], error: result.error }
    if (!result.data) return { status: 'pending', path: [] }
    const found = result.data.find((config) => config.uuid === uuids[index])
    if (!found) return { status: 'not-found', path: [] }
    path.push(found)
  }
  return { status: 'ready', path }
}
