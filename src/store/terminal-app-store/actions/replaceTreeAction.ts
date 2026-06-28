import type { TermGet, TermGroupId, TermNode, TermSet } from '../types'

/** Wholesale tree replacement used by session restore (after re-spawning PTYs). */
export function replaceTreeAction(
  set: TermSet,
  _get: TermGet,
  tree: TermNode,
  activeGroupId: TermGroupId,
): void {
  set({ tree, activeGroupId })
}
