import { create } from 'zustand'

interface TerminalGitPanelState {
  /** Per-pane (leaf id) visibility of the git changes panel. Hidden by default. */
  visibleByLeaf: Record<string, boolean>
  /** Toggle the panel for a single pane. */
  toggle: (leafId: string) => void
  /** Hide the panel for a single pane (the panel's own close button). */
  hide: (leafId: string) => void
}

/**
 * Per-pane visibility for the standalone Terminal app's git changes panel.
 * Each pane (leaf) is independent and starts HIDDEN; the user reveals it via
 * that pane's toolbar toggle. UI-only + ephemeral (not persisted) — every
 * launch starts with all panes hidden.
 */
export const useTerminalGitPanelStore = create<TerminalGitPanelState>((set) => ({
  visibleByLeaf: {},
  toggle: (leafId) =>
    set((s) => ({
      visibleByLeaf: { ...s.visibleByLeaf, [leafId]: !s.visibleByLeaf[leafId] },
    })),
  hide: (leafId) =>
    set((s) => ({ visibleByLeaf: { ...s.visibleByLeaf, [leafId]: false } })),
}))
