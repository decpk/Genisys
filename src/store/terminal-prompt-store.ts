import { create } from 'zustand'

interface TerminalPromptState {
  /** The pane (leaf group) whose prompt picker is open, or `null` when closed. */
  groupId: string | null
  /** Open the prompt picker for a pane. */
  open: (groupId: string) => void
  /** Close the prompt picker. */
  close: () => void
}

/**
 * UI-only state for the standalone Terminal app's "Insert prompt" picker.
 * Decouples the keyboard-shortcut trigger from the per-pane `PromptPicker`
 * mounted deep in the recursive pane tree — mirroring `useTerminalRenameStore`.
 * The shortcut opens the picker for the active pane; each pane's picker is shown
 * when `groupId` matches its leaf id. No persistence; reset on close.
 */
export const useTerminalPromptStore = create<TerminalPromptState>((set) => ({
  groupId: null,
  open: (groupId) => set({ groupId }),
  close: () => set({ groupId: null }),
}))
