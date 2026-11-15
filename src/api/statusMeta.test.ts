import { describe, expect, it } from 'vitest'
import { getStatusMetadata } from './statusMeta'
import type { PartStatus } from './types'

describe('getStatusMetadata', () => {
  it('returns the label and color for a known status', () => {
    expect(getStatusMetadata('active')).toEqual({ label: 'Active', color: 'green' })
  })

  it('falls back to the raw text for a status the server added later', () => {
    // `as` simulates untyped JSON from the server containing a status we do not know
    expect(getStatusMetadata('mystery' as PartStatus)).toEqual({ label: 'mystery', color: 'gray' })
  })
})
