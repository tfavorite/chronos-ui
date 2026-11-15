import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { QueryClient } from '@tanstack/react-query'
import { ApiError, getAllowedStatuses, getChildConfigs, getHealth, getPart, getRootConfigs, updatePart } from './client'
import type { TreeNode } from '../domain/tree'
import type { AllowableStatuses, Configuration, Part, UpdatePartBody } from './types'

const FIVE_MINUTES = 5 * 60 * 1000

export const queryKeys = {
  roots: ['configs', 'roots'] as const,
  children: (parentUuid: string) => ['configs', 'children', parentUuid] as const,
  part: (uuid: string) => ['part', uuid] as const,
  allowed: (uuid: string) => ['part', uuid, 'allowed'] as const,
  machineTree: (rootUuid: string) => ['machine-tree', rootUuid] as const,
  health: ['health'] as const,
}

// True for every part's allowed-statuses key, whichever part it belongs to.
function isAllowedKey(key: readonly unknown[]): boolean {
  return key[0] === 'part' && key[2] === 'allowed'
}

// Don't retry client errors (4xx); they won't fix themselves. Retry network/5xx twice.
function retry(failureCount: number, error: Error): boolean {
  if (error instanceof ApiError && error.status >= 400 && error.status < 500) return false
  return failureCount < 2
}

export function useRootConfigs() {
  return useQuery<Configuration[], ApiError>({
    queryKey: queryKeys.roots,
    queryFn: getRootConfigs,
    staleTime: FIVE_MINUTES,
    retry,
  })
}

// `enabled` keeps the tree lazy: children are fetched only once a node is expanded.
export function useChildConfigs(parentUuid: string, enabled: boolean) {
  return useQuery<Configuration[], ApiError>({
    queryKey: queryKeys.children(parentUuid),
    queryFn: () => getChildConfigs(parentUuid),
    staleTime: FIVE_MINUTES,
    enabled,
    retry,
  })
}

// Parts are cached by UUID, so every node using the same part shares one request and one cache entry.
export function usePart(uuid: string) {
  return useQuery<Part, ApiError>({
    queryKey: queryKeys.part(uuid),
    queryFn: () => getPart(uuid),
    staleTime: FIVE_MINUTES,
    retry,
  })
}

export function useAllowedStatuses(uuid: string) {
  return useQuery<AllowableStatuses, ApiError>({
    queryKey: queryKeys.allowed(uuid),
    queryFn: () => getAllowedStatuses(uuid),
    staleTime: 0,
    retry,
  })
}

export function useUpdatePart(uuid: string) {
  const queryClient = useQueryClient()
  return useMutation<Part, ApiError, UpdatePartBody>({
    mutationFn: (body) => updatePart(uuid, body),
    onSuccess: (updated) => {
      // Every tree node reading this part updates immediately.
      queryClient.setQueryData(queryKeys.part(uuid), updated)
      // Allowed transitions may depend on related parts, so refetch all of them.
      queryClient.invalidateQueries({ predicate: (query) => isAllowedKey(query.queryKey) })
    },
    onError: (error) => {
      // Part was removed by someone else: refetch so the panel shows that instead of stale data.
      if (error.status === 404) queryClient.invalidateQueries({ queryKey: queryKeys.part(uuid) })
    },
  })
}

async function loadTree(queryClient: QueryClient, config: Configuration): Promise<TreeNode> {
  const kids = await queryClient.query({
    queryKey: queryKeys.children(config.uuid),
    queryFn: () => getChildConfigs(config.uuid),
    staleTime: FIVE_MINUTES,
  })
  return { config, children: await Promise.all(kids.map((kid) => loadTree(queryClient, kid))) }
}

// Loads a whole machine (one request per parent, in parallel per level). Only runs when `enabled`,
// because the API has no "where is this part used" endpoint, so we have to crawl.
// Once a machine has been crawled, its result stays in the cache, so later visits show it
// without another click. `enabled` is only needed for the first crawl.
export function useMachineTree(root: Configuration, enabled: boolean) {
  const queryClient = useQueryClient()
  const alreadyLoaded = queryClient.getQueryData(queryKeys.machineTree(root.uuid)) !== undefined
  return useQuery<TreeNode, ApiError>({
    queryKey: queryKeys.machineTree(root.uuid),
    queryFn: () => loadTree(queryClient, root),
    staleTime: FIVE_MINUTES,
    enabled: enabled || alreadyLoaded,
    retry,
  })
}

// Used for a banner when the API is unreachable or the key is rejected.
export function useHealth() {
  return useQuery<{ status: string; message: string }, ApiError>({
    queryKey: queryKeys.health,
    queryFn: getHealth,
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
    retry: false,
  })
}
