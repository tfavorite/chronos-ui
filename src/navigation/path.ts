// The current position in the hierarchy lives in the URL hash as config UUIDs:
//   #/<endUnitUuid>/<childUuid>/<grandchildUuid>
// so the browser back button, reload and shared links all work.

// turn UUIDs into a hash string. [] -> '#/'   ['a', 'b'] -> '#/a/b'
export function formatPath(uuids: string[]): string {
  return `#/${uuids.join('/')}`
}

// the reverse. '#/a/b' -> ['a', 'b']   ''/'#/' -> []   ignore empty segments ('#/a//b')
export function parsePath(hash: string): string[] {
  return hash.replace(/^#\/?/, '').split('/').filter(Boolean)
}
