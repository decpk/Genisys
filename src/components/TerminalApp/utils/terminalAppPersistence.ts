import { terminalCreate } from '@/components/Terminal/api/terminalCreate'
import { terminalCwd } from '@/components/Terminal/api/terminalCwd'
import { formatSessionTitle } from '@/components/Terminal/utils/formatSessionTitle'
import { useTerminalAppStore } from '@/store/terminal-app-store'
import {
  collectLeaves,
  collectTabs,
  createGroupId,
  createLeaf,
  createPersistentId,
} from '@/store/terminal-app-store/treeUtils'
import type {
  TermGroupId,
  TermNode,
  TermSplit,
  TermSplitDirection,
  TermTab,
} from '@/store/terminal-app-store/types'

import {
  pruneTerminalSessions,
  stageSessionReplay,
} from './terminalSessionStore'

const SNAPSHOT_KEY = 'genisys.terminalApp.snapshot'
const RESTORE_FLAG_KEY = 'genisys.terminalApp.restore'
const SAVE_DEBOUNCE_MS = 500

// ── Persisted shape (structure only; no live runtime ids/handles) ──────────
interface PersistedTab {
  title: string;
  cwd: string | null;
  pinned?: boolean;
  customTitle?: boolean;
  themeId?: string;
  fontFamily?: string | null;
  /**
   * Stable key for this tab's saved scrollback file on disk. Optional so older
   * snapshots (written before scrollback persistence) still load — a fresh id
   * is minted on restore when absent (that tab simply has no saved scrollback
   * yet).
   */
  persistentId?: string;
}
interface PersistedLeaf {
  kind: 'leaf'
  tabs: PersistedTab[]
  activeTabIndex: number
  active?: boolean
}
interface PersistedSplit {
  kind: 'split'
  direction: TermSplitDirection
  sizes: [number, number]
  children: [PersistedNode, PersistedNode]
}
type PersistedNode = PersistedLeaf | PersistedSplit
interface PersistedSnapshot {
  version: 1
  tree: PersistedNode
}

// ── Opt-in flag (defaults ON) ──────────────────────────────────────────────
export function isTerminalRestoreEnabled(): boolean {
  try {
    return localStorage.getItem(RESTORE_FLAG_KEY) !== 'off'
  } catch {
    return true
  }
}

export function setTerminalRestoreEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(RESTORE_FLAG_KEY, enabled ? 'on' : 'off')
  } catch {
    /* ignore */
  }
}

// ── Serialize ──────────────────────────────────────────────────────────────
function serializeNode(
  node: TermNode,
  activeGroupId: TermGroupId,
  cwdById: Map<string, string>,
): PersistedNode {
  if (node.kind === 'leaf') {
    const activeIndex = node.tabs.findIndex((t) => t.id === node.activeTabId)
    return {
      kind: "leaf",
      tabs: node.tabs.map((t) => ({
        title: t.title,
        cwd: cwdById.get(t.id) ?? t.cwd,
        pinned: t.pinned,
        customTitle: t.customTitle,
        themeId: t.themeId,
        fontFamily: t.fontFamily,
        persistentId: t.persistentId,
      })),
      activeTabIndex: activeIndex === -1 ? 0 : activeIndex,
      active: node.id === activeGroupId,
    };
  }
  return {
    kind: 'split',
    direction: node.direction,
    sizes: node.sizes,
    children: [
      serializeNode(node.children[0], activeGroupId, cwdById),
      serializeNode(node.children[1], activeGroupId, cwdById),
    ],
  }
}

function writeSnapshot(snapshot: PersistedSnapshot): void {
  try {
    localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(snapshot))
  } catch {
    /* quota / serialization issues are non-fatal */
  }
}

function clearSnapshot(): void {
  try {
    localStorage.removeItem(SNAPSHOT_KEY)
  } catch {
    /* ignore */
  }
}

/**
 * Probe each live session's working directory (backend PID probe) and persist
 * the full split-tree. Pure read of the store — never mutates it, so it can't
 * feed back into the persistence effect.
 */
async function persistNow(): Promise<void> {
  const { tree, activeGroupId } = useTerminalAppStore.getState()
  const tabs = collectTabs(tree)
  if (tabs.length === 0) {
    clearSnapshot()
    return
  }
  const cwdById = new Map<string, string>()
  await Promise.all(
    tabs.map(async (t) => {
      if (t.exited) return
      const cwd = await terminalCwd(t.id).catch(() => null)
      if (cwd) cwdById.set(t.id, cwd)
    }),
  )
  writeSnapshot({ version: 1, tree: serializeNode(tree, activeGroupId, cwdById) })
}

let saveTimer: ReturnType<typeof setTimeout> | null = null

/** Debounced snapshot save (coalesces rapid tab/split/focus churn). */
export function scheduleTerminalSnapshotSave(): void {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    saveTimer = null
    void persistNow()
  }, SAVE_DEBOUNCE_MS)
}

// ── Restore ────────────────────────────────────────────────────────────────
function loadSnapshot(): PersistedSnapshot | null {
  try {
    const raw = localStorage.getItem(SNAPSHOT_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as PersistedSnapshot
    if (parsed?.version !== 1 || !parsed.tree) return null
    return parsed
  } catch {
    return null
  }
}

async function spawnTab(persisted: PersistedTab): Promise<TermTab | null> {
  const cwd = persisted.cwd ?? undefined
  let created
  try {
    created = await terminalCreate({ cwd, cols: 80, rows: 24 })
  } catch {
    try {
      created = await terminalCreate({ cols: 80, rows: 24 })
    } catch {
      return null
    }
  }
  const persistentId = persisted.persistentId ?? createPersistentId()
  // Stage the tab's saved scrollback (if any) for replay into the fresh shell's
  // surface the instant it mounts. Keyed by the NEW PTY session id. Only attempt
  // when the snapshot carried a stable key (older snapshots have none).
  if (persisted.persistentId) {
    await stageSessionReplay(persistentId, created.id)
  }
  return {
    id: created.id,
    persistentId,
    title:
      persisted.customTitle || !created.cwd
        ? persisted.title
        : formatSessionTitle(0, created.shell, created.cwd),
    shell: created.shell,
    cwd: created.cwd,
    createdAt: Date.now(),
    exited: false,
    exitCode: null,
    pinned: persisted.pinned ?? false,
    customTitle: persisted.customTitle ?? false,
    themeId: persisted.themeId,
    fontFamily: persisted.fontFamily ?? null,
  };
}

async function rebuildNode(
  node: PersistedNode,
): Promise<{ node: TermNode; activeLeafId: TermGroupId | null }> {
  if (node.kind === 'leaf') {
    const tabs: TermTab[] = []
    for (const pt of node.tabs) {
      const tab = await spawnTab(pt)
      if (tab) tabs.push(tab)
    }
    if (tabs.length === 0) {
      const empty = createLeaf()
      return { node: empty, activeLeafId: null }
    }
    const activeTab = tabs[Math.min(node.activeTabIndex, tabs.length - 1)] ?? tabs[0]
    const leaf = createLeaf({ tabs, activeTabId: activeTab.id })
    return { node: leaf, activeLeafId: node.active ? leaf.id : null }
  }
  const left = await rebuildNode(node.children[0])
  const right = await rebuildNode(node.children[1])
  const split: TermSplit = {
    kind: 'split',
    id: createGroupId(),
    direction: node.direction,
    sizes: node.sizes,
    children: [left.node, right.node],
  }
  return { node: split, activeLeafId: left.activeLeafId ?? right.activeLeafId }
}

/**
 * Rebuild the saved split-tree by re-spawning a shell per tab in its last
 * working directory. Returns `true` when the tree was restored, `false` when
 * restore is disabled / there was nothing to restore (caller then ensures a
 * single fresh tab).
 */
export async function runTerminalRestore(): Promise<boolean> {
  if (!isTerminalRestoreEnabled()) return false
  const snapshot = loadSnapshot()
  if (!snapshot) return false

  const { node, activeLeafId } = await rebuildNode(snapshot.tree)
  if (collectTabs(node).length === 0) return false

  const activeGroupId = activeLeafId ?? collectLeaves(node)[0].id
  useTerminalAppStore.getState().replaceTree(node, activeGroupId)
  // GC saved scrollback orphaned by a crash or by tabs removed while the app was
  // closed: keep only files for tabs present in the snapshot we just restored.
  void pruneTerminalSessions(collectPersistedKeys(snapshot.tree))
  return true
}

/** Collect every stable scrollback key present in a persisted snapshot tree. */
function collectPersistedKeys(node: PersistedNode): string[] {
  if (node.kind === 'leaf') {
    return node.tabs
      .map((t) => t.persistentId)
      .filter((k): k is string => typeof k === 'string' && k.length > 0)
  }
  return [
    ...collectPersistedKeys(node.children[0]),
    ...collectPersistedKeys(node.children[1]),
  ]
}
