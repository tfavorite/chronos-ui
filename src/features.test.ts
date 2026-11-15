import { describe, expect, it } from 'vitest'
import { isDebugEnabled, isFeatureEnabled } from './features'

describe('isFeatureEnabled', () => {
  it('is off without the param', () => expect(isFeatureEnabled('usage', '')).toBe(false))
  it('is on when listed', () => expect(isFeatureEnabled('usage', '?features=usage,other')).toBe(true))
  it('ignores other names', () => expect(isFeatureEnabled('usage', '?features=other')).toBe(false))
  it('tolerates spaces', () => expect(isFeatureEnabled('usage', '?features=other, usage')).toBe(true))
})

describe('isDebugEnabled', () => {
  it('is off by default', () => expect(isDebugEnabled('')).toBe(false))
  it('is on only for debug=true', () => {
    expect(isDebugEnabled('?debug=true')).toBe(true)
    expect(isDebugEnabled('?debug=1')).toBe(false)
  })
})
