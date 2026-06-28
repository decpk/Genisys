import type { StoreApi } from 'zustand'

/** Unique id for a node in the terminal split-tree (leaf or split). */
export type TermGroupId = string

/**
 * Split orientation.
 * - `horizontal` → children are laid out side-by-side (left | right).
 * - `vertical`   → children are stacked (top / bottom).
 */
export type TermSplitDirection = 'horizontal' | 'vertical'

/**
 * Edge a tab was dropped onto during drag-and-drop. The four cardinal edges
 * split a new pane off the target; `center` merges into the target's tab strip.
 */
export type TermDropEdge = 'top' | 'right' | 'bottom' | 'left' | 'center'

/** A single terminal tab. `id` is the backend PTY session id (globally unique). */
export interface TermTab {
  id: string
  /**
   * Stable id for this tab's persisted session data (its scrollback file on
   * disk). Unlike `id` — which is the PTY session id and is re-allocated on
   * every app launch — this is generated once when the tab is created and
   * carried through session restore, so saved scrollback can be re-attached to
   * the same tab. Used as the on-disk filename key (`<persistentId>.ans`).
   */
  persistentId: string
  title: string
  shell: string
  cwd: string | null
  createdAt: number
  exited: boolean
  exitCode: number | null
  /**
   * When `true`, the tab is protected from closing: bulk closes (Close All +
   * Close Pane) skip it, and an explicit close (its close button / `closeTab`)
   * is refused with an error toast until it is unpinned. Absent/`false` means
   * a normal, closable tab.
   */
  pinned?: boolean
  /**
   * When `true`, the user has manually renamed the tab. The title is then
   * frozen and no longer re-derived from the working directory on `cd`,
   * split, or session restore. Absent/`false` means the title auto-tracks cwd.
   */
  customTitle?: boolean
  /**
   * Per-tab terminal color scheme id (see `components/TerminalApp/terminalThemes`).
   * When set, this tab's xterm surface uses that palette instead of the global
   * app theme and the tab chip is tinted to match. Absent = follow the global theme.
   */
  themeId?: string
  /**
   * Per-tab xterm `font-family` CSS stack (chosen from `MONOSPACE_FONT_OPTIONS`).
   * When set, overrides the global terminal font for this tab only. Absent/`null`
   * = follow the global "Terminal font family" setting.
   */
  fontFamily?: string | null
}

/** A leaf pane: owns an ordered list of terminal tabs and the active one. */
export interface TermLeaf {
  kind: 'leaf'
  id: TermGroupId
  tabs: TermTab[]
  activeTabId: string | null
}

/** A split node: two children laid out along `direction` with normalized sizes. */
export interface TermSplit {
  kind: 'split'
  id: TermGroupId
  direction: TermSplitDirection
  children: [TermNode, TermNode]
  /** Normalized ratios in `[0, 1]` summing to ~1. */
  sizes: [number, number]
}

export type TermNode = TermLeaf | TermSplit

export interface CreateTabInput {
  cwd?: string
  shell?: string
  args?: string[]
  /** Target leaf to add the tab to; defaults to the active leaf. */
  groupId?: TermGroupId
  cols?: number
  rows?: number
}

export interface TerminalAppState {
  /** Root of the split-tree. Always contains at least one leaf. */
  tree: TermNode
  /** The leaf that currently has focus (new tabs / splits target it). */
  activeGroupId: TermGroupId
}

export interface TerminalAppActions {
  /** Spawn a PTY and add a tab to the target (or active) leaf. Returns session id. */
  createTab: (input?: CreateTabInput) => Promise<string | null>
  /**
   * Kill the session and remove its tab; collapses the pane if it becomes
   * empty. Pinned tabs are not closed — an error toast is shown instead.
   */
  closeTab: (tabId: string) => Promise<void>
  setActiveTab: (tabId: string, groupId?: TermGroupId) => void
  setActiveGroup: (groupId: TermGroupId) => void
  /** Toggle a tab's pinned state. Pinning notifies with an Unpin action. */
  togglePinTab: (tabId: string) => void
  /** Set a tab's title manually, freezing it from cwd-derived auto-titling. */
  renameTab: (tabId: string, title: string) => void
  /** Set (or clear, with `null`) a tab's terminal color scheme. */
  setTabTheme: (tabId: string, themeId: string | null) => void
  /** Set (or clear, with `null`) a tab's terminal font-family override. */
  setTabFontFamily: (tabId: string, fontFamily: string | null) => void
  /** Split a leaf, spawning a fresh terminal in the new pane. Returns the new leaf id. */
  splitGroup: (groupId: TermGroupId, direction: TermSplitDirection) => Promise<string | null>
  /** Move an existing tab into another pane's tab strip (drag-and-drop centre move). */
  moveTabToGroup: (tabId: string, targetGroupId: TermGroupId, insertIndex?: number) => void
  /** Move an existing tab into a new pane split off `edge` of the target (drag-and-drop edge split). */
  moveTabToSplit: (tabId: string, targetGroupId: TermGroupId, edge: TermDropEdge) => void
  /** Kill the unpinned sessions in a leaf; pinned tabs survive. Collapses it when emptied. */
  closeGroup: (groupId: TermGroupId) => Promise<void>
  /** Kill every unpinned session across all panes; pinned tabs survive (Close All). */
  closeAllTabs: () => Promise<void>
  reorderTabs: (groupId: TermGroupId, fromIndex: number, toIndex: number) => void
  setGroupSizes: (splitId: TermGroupId, sizes: [number, number]) => void
  /** Update a session's live working directory (OSC 7 / backend probe driven). */
  setSessionCwd: (tabId: string, cwd: string) => void
  handleSessionExit: (tabId: string, code: number | null) => void
  /** Replace the whole tree wholesale (used by session restore). */
  replaceTree: (tree: TermNode, activeGroupId: TermGroupId) => void
}

export type TerminalAppStore = TerminalAppState & TerminalAppActions

export type TermSet = StoreApi<TerminalAppStore>['setState']
export type TermGet = StoreApi<TerminalAppStore>['getState']
