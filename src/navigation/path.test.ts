import { describe, expect, it } from 'vitest'
import { formatPath, parsePath, pathTo } from './path'

describe('path', () => {
  it('formats', () => {
    expect(formatPath([])).toBe('#/')
    expect(formatPath(['a', 'b'])).toBe('#/a/b')
  })
  it('parses', () => {
    expect(parsePath('#/a/b')).toEqual(['a', 'b'])
    expect(parsePath('')).toEqual([])
    expect(parsePath('#/')).toEqual([])
    expect(parsePath('#/a//b')).toEqual(['a', 'b'])
  })
  it('builds a URL from a route of configurations', () => {
    const route = [
      { uuid: 'a', partUuid: 'p', quantity: 1 },
      { uuid: 'b', partUuid: 'q', quantity: 2 },
    ]
    expect(pathTo(route)).toBe('#/a/b')
    expect(pathTo([])).toBe('#/')
  })
})
