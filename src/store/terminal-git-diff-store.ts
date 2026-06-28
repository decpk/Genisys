import { create } from 'zustand'

import type { GitDiffSide } from '@/ai/tools/_shared/git/git.types'

/** Identifies the single git file diff currently shown over a terminal pane. */
export interface TerminalGitDiffTarget {
  /** The pane (leaf group) whose terminal the diff overlay covers. */
  leafId: string
  /** Absolute git repository root the `file` path is resolved against. */
  gitRoot: string
  /** File path relative to `gitRoot`. */
  file: string
  /** Which diff to show (`head` = HEAD ↔ working tree = all local changes). */
  side: GitDiffSide
}

interface TerminalGitDiffState {
  /** The open diff, or `null` when no overlay is shown. */
  target: TerminalGitDiffTarget | null
  /** Open the diff overlay for a file in a pane (replaces any open diff). */
  openDiff: (target: TerminalGitDiffTarget) => void
  /** Close the diff overlay. */
  close: () => void
}

/**
 * UI-only state for the standalone Terminal app's git diff overlay. Decouples
 * the per-pane git panel (which triggers a diff on file click) from the overlay
 * rendered inside the matching pane's surface — mirroring `useTerminalPromptStore`
 * / `useTerminalRenameStore`. Only one diff is shown at a time. No persistence.
 */
export const useTerminalGitDiffStore = create<TerminalGitDiffState>((set) => ({
  target: null,
  openDiff: (target) => set({ target }),
  close: () => set({ target: null }),
}))
