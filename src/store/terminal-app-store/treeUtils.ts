import type {
  TermGroupId,
  TermLeaf,
  TermNode,
  TermSplitDirection,
  TermTab,
} from './types'

let groupCounter = 0

/** Generate a process-unique split-tree node id. */
export function createGroupId(): TermGroupId {
  groupCounter += 1
  return `tg-${Date.now().toString(36)}-${groupCounter.toString(36)}`
}

/**
 * Generate a stable id for a tab's persisted session data (its scrollback file
 * key). Unlike `createGroupId`, this is a random UUID so it never collides
 * across app launches and is safe to use directly as a filename (it matches the
 * backend session-key charset `[A-Za-z0-9_-]`).
 */
export function createPersistentId(): string {
  return crypto.randomUUID()
}

/** Build a fresh leaf, optionally seeded with tabs + an active tab. */
export function createLeaf(
  init?: Partial<Pick<TermLeaf, 'tabs' | 'activeTabId'>>,
): TermLeaf {
  return {
    kind: 'leaf',
    id: createGroupId(),
    tabs: init?.tabs ?? [],
    activeTabId: init?.activeTabId ?? null,
  }
}

/** The initial single-empty-leaf tree used at store creation. */
export function createInitialTree(): { tree: TermNode; activeGroupId: TermGroupId } {
  const leaf = createLeaf()
  return { tree: leaf, activeGroupId: leaf.id }
}

/** Find the leaf with `id`, or `null`. */
export function findLeaf(tree: TermNode, id: TermGroupId): TermLeaf | null {
  if (tree.kind === 'leaf') return tree.id === id ? tree : null
  return findLeaf(tree.children[0], id) ?? findLeaf(tree.children[1], id)
}

/** Find the leaf that contains the tab with `tabId`, or `null`. */
export function findLeafByTabId(tree: TermNode, tabId: string): TermLeaf | null {
  if (tree.kind === 'leaf') {
    return tree.tabs.some((t) => t.id === tabId) ? tree : null
  }
  return (
    findLeafByTabId(tree.children[0], tabId) ??
    findLeafByTabId(tree.children[1], tabId)
  )
}

type LeafUpdater = (leaf: TermLeaf) => TermNode

/**
 * Immutable replacement of the leaf with `id`. The updater may return a
 * mutated leaf or a brand-new node (e.g. a split). Returns the original tree
 * reference when nothing changed so referential checks stay cheap.
 */
export function updateLeaf(
  tree: TermNode,
  id: TermGroupId,
  updater: LeafUpdater,
): TermNode {
  if (tree.kind === 'leaf') {
    if (tree.id !== id) return tree
    const next = updater(tree)
    return next === tree ? tree : next
  }
  const [left, right] = tree.children
  const newLeft = updateLeaf(left, id, updater)
  if (newLeft !== left) return { ...tree, children: [newLeft, right] }
  const newRight = updateLeaf(right, id, updater)
  if (newRight !== right) return { ...tree, children: [left, newRight] }
  return tree
}

/** Immutable update of a split node's sizes. */
export function updateSplitSizes(
  tree: TermNode,
  splitId: TermGroupId,
  sizes: [number, number],
): TermNode {
  if (tree.kind === 'leaf') return tree
  if (tree.id === splitId) return { ...tree, sizes }
  const [left, right] = tree.children
  const newLeft = updateSplitSizes(left, splitId, sizes)
  if (newLeft !== left) return { ...tree, children: [newLeft, right] }
  const newRight = updateSplitSizes(right, splitId, sizes)
  if (newRight !== right) return { ...tree, children: [left, newRight] }
  return tree
}

/** All leaves, left-to-right (in-order). */
export function collectLeaves(tree: TermNode): TermLeaf[] {
  if (tree.kind === 'leaf') return [tree]
  return [...collectLeaves(tree.children[0]), ...collectLeaves(tree.children[1])]
}

/** Every tab across every leaf, in layout order. */
export function collectTabs(tree: TermNode): TermTab[] {
  return collectLeaves(tree).flatMap((l) => l.tabs)
}

/**
 * Drop a leaf's unpinned tabs, keeping pinned ones, and recompute a valid
 * active tab (the previous active when it survives, else the first pinned tab,
 * else `null`). Pure — used by Close Pane and Close All to honour pinning.
 */
export function retainPinnedTabs(leaf: TermLeaf): {
  tabs: TermTab[]
  activeTabId: string | null
} {
  const tabs = leaf.tabs.filter((t) => t.pinned)
  const activeTabId = tabs.some((t) => t.id === leaf.activeTabId)
    ? leaf.activeTabId
    : (tabs[0]?.id ?? null)
  return { tabs, activeTabId }
}

interface SplitLeafOptions {
  targetGroupId: TermGroupId
  direction: TermSplitDirection
  newLeaf: TermLeaf
  /** Place the new leaf `before` (left/top) or `after` (right/bottom) the target. */
  side: 'before' | 'after'
}

/**
 * Replace the target leaf with a split node holding the target and `newLeaf`.
 * Returns the new split id (or `null` if the target was not found).
 */
export function splitLeafInTree(
  tree: TermNode,
  options: SplitLeafOptions,
): { tree: TermNode; splitId: TermGroupId | null } {
  const { targetGroupId, direction, newLeaf, side } = options
  let splitId: TermGroupId | null = null
  const next = updateLeaf(tree, targetGroupId, (leaf) => {
    splitId = createGroupId()
    const children: [TermNode, TermNode] =
      side === 'before' ? [newLeaf, leaf] : [leaf, newLeaf]
    return { kind: 'split', id: splitId, direction, children, sizes: [0.5, 0.5] }
  })
  return { tree: next, splitId }
}

/**
 * Drop every empty leaf and collapse splits that lose a child. If everything
 * is empty, a single fresh empty leaf is returned. `preferredActiveId` is kept
 * as the active group when it survives, otherwise the first remaining leaf wins.
 */
export function pruneEmptyLeaves(
  tree: TermNode,
  preferredActiveId: TermGroupId | null,
): { tree: TermNode; activeGroupId: TermGroupId } {
  function prune(node: TermNode): TermNode | null {
    if (node.kind === 'leaf') return node.tabs.length === 0 ? null : node
    const left = prune(node.children[0])
    const right = prune(node.children[1])
    if (left && right) {
      if (left === node.children[0] && right === node.children[1]) return node
      return { ...node, children: [left, right] }
    }
    return left ?? right ?? null
  }

  const pruned = prune(tree)
  if (!pruned) {
    const leaf = createLeaf()
    return { tree: leaf, activeGroupId: leaf.id }
  }
  const leaves = collectLeaves(pruned)
  const activeGroupId =
    preferredActiveId && leaves.some((l) => l.id === preferredActiveId)
      ? preferredActiveId
      : leaves[0].id
  return { tree: pruned, activeGroupId }
}

/**
 * Remove the tab `tabId` from whichever leaf holds it WITHOUT killing its PTY
 * session — the tab object is returned so a caller can re-insert it elsewhere
 * (drag-to-split / drag-between-panes). The source leaf is kept even if it
 * becomes empty; the active tab falls back to a neighbour. Callers that move
 * the tab to another leaf should run `pruneEmptyLeaves` afterwards to collapse
 * a now-empty source pane. Returns `null` when the tab is not found.
 */
export function removeTabFromTree(
  tree: TermNode,
  tabId: string,
): { tree: TermNode; tab: TermTab; sourceLeafId: TermGroupId } | null {
  const leaf = findLeafByTabId(tree, tabId)
  if (!leaf) return null
  const idx = leaf.tabs.findIndex((t) => t.id === tabId)
  if (idx === -1) return null
  const tab = leaf.tabs[idx]
  const remaining = leaf.tabs.filter((t) => t.id !== tabId)
  let nextActive = leaf.activeTabId
  if (nextActive === tabId) {
    const fallback = remaining[idx] ?? remaining[idx - 1] ?? null
    nextActive = fallback ? fallback.id : null
  }
  const next = updateLeaf(tree, leaf.id, (l) => ({
    ...l,
    tabs: remaining,
    activeTabId: nextActive,
  }))
  return { tree: next, tab, sourceLeafId: leaf.id }
}
