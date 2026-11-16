import { describe, expect, it } from 'vitest'
import { isDebugEnabled } from './features'

describe('isDebugEnabled', () => {
  it('is off by default', () => expect(isDebugEnabled('')).toBe(false))
  it('is on only for debug=true', () => {
    expect(isDebugEnabled('?debug=true')).toBe(true)
    expect(isDebugEnabled('?debug=1')).toBe(false)
  })
})
