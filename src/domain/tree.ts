import type { Configuration } from '../api/types'

// A configuration plus everything below it, loaded recursively.
export interface TreeNode {
  config: Configuration
  children: TreeNode[]
}

// how many nodes in this tree (including `root` itself) reference `partUuid`?
export function countPartUsages(root: TreeNode, partUuid: string): number {
  return root.children.reduce((count, child) => count + countPartUsages(child, partUuid), root.config.partUuid === partUuid ? 1 : 0)
}

// total quantity of `partUuid` needed to build this machine.
// A node's quantity is multiplied by the quantities of all its ancestors
// (2 sub-assemblies x 3 screws each = 6 screws). Sum that over every matching node.
export function totalQuantity(root: TreeNode, partUuid: string): number {
  return root.children.reduce((total, child) => total + (totalQuantity(child, partUuid) * root.config.quantity), root.config.partUuid === partUuid ? root.config.quantity : 0)
}

// Every place `partUuid` appears, as the route of configurations from `root` down to it.
export function findPartPaths(root: TreeNode, partUuid: string, above: Configuration[] = []): Configuration[][] {
  const here = [...above, root.config]
  const found = root.config.partUuid === partUuid ? [here] : []
  return found.concat(...root.children.map((child) => findPartPaths(child, partUuid, here)))
}
