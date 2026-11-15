import { describe, expect, it } from 'vitest'
import { countPartUsages, findPartPaths, totalQuantity } from './tree'
import type { TreeNode } from './tree'

function node(partUuid: string, quantity: number, children: TreeNode[] = []): TreeNode {
  return { config: { uuid: `${partUuid}-${quantity}-${children.length}`, partUuid, quantity }, children }
}

// machine(1)
//   ├─ box(2)
//   │    └─ screw(3)
//   └─ screw(5)
const tree = node('machine', 1, [node('box', 2, [node('screw', 3)]), node('screw', 5)])

describe('countPartUsages', () => {
  it('counts every node using the part', () => expect(countPartUsages(tree, 'screw')).toBe(2))
  it('counts the root too', () => expect(countPartUsages(tree, 'machine')).toBe(1))
  it('is 0 when the part is absent', () => expect(countPartUsages(tree, 'nope')).toBe(0))
})

describe('totalQuantity', () => {
  it('multiplies quantities down each path, then sums', () => {
    expect(totalQuantity(tree, 'screw')).toBe(1 * 2 * 3 + 1 * 5) // 11
  })
  it('is 0 when the part is absent', () => expect(totalQuantity(tree, 'nope')).toBe(0))
})

describe('findPartPaths', () => {
  it('returns the route from the root to each use', () => {
    const routes = findPartPaths(tree, 'screw').map((route) => route.map((c) => c.partUuid))
    expect(routes).toEqual([['machine', 'box', 'screw'], ['machine', 'screw']])
  })
  it('is empty when the part is absent', () => expect(findPartPaths(tree, 'nope')).toEqual([]))
})

// frame(2)
//   └─ frame(3)    the same part appears at two levels of one path
const nestedFrames = node('frame', 2, [node('frame', 3)])

describe('a part matching at two levels of the same path', () => {
  it('counts both uses', () => expect(countPartUsages(nestedFrames, 'frame')).toBe(2))

  it('adds the outer ones to the inner ones, multiplied by the outer quantity', () => {
    // 2 outer frames, plus 3 inner frames inside each of them: 2 + 2 * 3
    expect(totalQuantity(nestedFrames, 'frame')).toBe(8)
  })
})
