import { describe, expect, it } from 'vitest'
import { selectableStatuses } from './status'

describe('selectableStatuses', () => {
  it('drops the current status', () => {
    expect(selectableStatuses('active', ['active', 'deprecated'])).toEqual(['deprecated'])
  })
  it('is empty when the part is locked', () => {
    expect(selectableStatuses('configuration', ['configuration'])).toEqual([])
  })
  it('keeps everything when the current status is not listed', () => {
    expect(selectableStatuses('draft', ['active'])).toEqual(['active'])
  })
})
