// Developer tools (React Query devtools) only show with ?debug=true.
export function isDebugEnabled(search: string = window.location.search): boolean {
  return new URLSearchParams(search).get('debug') === 'true'
}
