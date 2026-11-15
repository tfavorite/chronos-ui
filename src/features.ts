// Features that cost extra API calls are off by default. Turn them on with a URL param:
//   ?features=usage
export type Feature = 'usage'

// usage:  "Where else is this part used?" crawls a whole machine (~1 request per parent).
export function isFeatureEnabled(feature: Feature, search: string = window.location.search): boolean {
  const raw = new URLSearchParams(search).get('features') ?? ''
  return raw.split(',').map((name) => name.trim()).includes(feature)
}

// Developer tools (React Query devtools) only show with ?debug=true.
export function isDebugEnabled(search: string = window.location.search): boolean {
  return new URLSearchParams(search).get('debug') === 'true'
}
