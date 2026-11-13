import { describe, expect, it } from 'vitest'
import { formatPath, parsePath } from './path'

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
})
