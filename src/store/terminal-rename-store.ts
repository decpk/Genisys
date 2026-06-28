import { create } from 'zustand'

interface TerminalRenameState {
  /** The tab currently being renamed, or `null` when the modal is closed. */
  tabId: string | null
  /** Open the rename modal for a tab. */
  open: (tabId: string) => void
  /** Close the rename modal. */
  close: () => void
}

/**
 * UI-only state for the standalone Terminal app's "Rename Tab" modal. Decouples
 * the trigger (a tab's context menu / double-click, deep in the recursive pane
 * tree) from the dialog host mounted at the app root — mirroring how the Share
 * panel uses `useRemoteTerminalStore`. No persistence; reset on close.
 */
export const useTerminalRenameStore = create<TerminalRenameState>((set) => ({
  tabId: null,
  open: (tabId) => set({ tabId }),
  close: () => set({ tabId: null }),
}))
