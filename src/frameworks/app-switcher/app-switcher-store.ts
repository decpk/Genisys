import { create } from 'zustand'

import type { AppView } from '@/components/ActivityBar'

// ── State & actions ──────────────────────────────────────────────────

export interface AppSwitcherState {
  /** Whether the HUD is currently visible. */
  open: boolean
  /**
   * Candidate apps in display order (most-recently-used). Snapshot taken
   * when the HUD opens; subsequent advances cycle through this list
   * without rebuilding it.
   */
  candidates: AppView[]
  /** Currently highlighted index into {@link candidates}. */
  highlightedIndex: number
}

export interface AppSwitcherActions {
  /**
   * Open the HUD with a freshly-snapshotted candidate list, or — if the
   * HUD is already open — advance the highlight in the given direction.
   *
   * @param direction `+1` cycles forward (next), `-1` cycles backward (previous).
   * @param candidates MRU-ordered list of app views to cycle through.
   *
   * When opening fresh, the highlight lands on:
   *   - direction `+1` → index 1 (the previously-active app) — true macOS Cmd+Tab feel.
   *   - direction `-1` → last index (oldest app in MRU).
   *
   * If `candidates.length <= 1` the call is a no-op (nothing to switch to).
   */
  openOrAdvance: (direction: 1 | -1, candidates: AppView[]) => void

  /** Advance the highlight without changing the candidate snapshot. */
  advance: (direction: 1 | -1) => void

  /** Move highlight to an explicit index (e.g. on hover). Clamped silently. */
  setHighlightedIndex: (index: number) => void

  /**
   * Remove an app from the candidate list (e.g. when the user closes it from
   * the HUD). Keeps the highlight clamped to the new list and closes the HUD
   * if no candidates remain. No-op when the HUD is not open or the app is
   * not a candidate.
   */
  removeCandidate: (app: AppView) => void

  /**
   * Commit the highlighted app (invokes the provided callback) and close
   * the HUD. No-op when the HUD is not open.
   */
  commit: (onSelect: (app: AppView) => void) => void

  /** Close the HUD without committing (e.g. on Escape). */
  close: () => void
}

// ── Store ────────────────────────────────────────────────────────────

export const useAppSwitcherStore = create<AppSwitcherState & AppSwitcherActions>()((set, get) => ({
  open: false,
  candidates: [],
  highlightedIndex: 0,

  openOrAdvance: (direction, candidates) => {
    if (candidates.length <= 1) return

    const state = get()
    if (state.open) {
      // Already open — just advance.
      get().advance(direction)
      return
    }

    const initialIndex =
      direction === 1
        ? Math.min(1, candidates.length - 1)
        : candidates.length - 1

    set({
      open: true,
      candidates,
      highlightedIndex: initialIndex,
    })
  },

  advance: (direction) => {
    const { open, candidates, highlightedIndex } = get()
    if (!open || candidates.length === 0) return
    const length = candidates.length
    const next = (highlightedIndex + direction + length) % length
    set({ highlightedIndex: next })
  },

  setHighlightedIndex: (index) => {
    const { open, candidates } = get()
    if (!open || candidates.length === 0) return
    const clamped = Math.max(0, Math.min(candidates.length - 1, index))
    set({ highlightedIndex: clamped })
  },

  removeCandidate: (app) => {
    const { open, candidates, highlightedIndex } = get()
    if (!open) return
    const removedIndex = candidates.indexOf(app)
    if (removedIndex === -1) return

    const nextCandidates = candidates.filter((a) => a !== app)
    if (nextCandidates.length === 0) {
      set({ open: false, candidates: [], highlightedIndex: 0 })
      return
    }

    // Keep the highlight stable: if we removed an entry before the highlight,
    // shift it back by one so the same app stays highlighted; otherwise clamp.
    let nextIndex = highlightedIndex
    if (removedIndex < highlightedIndex) nextIndex -= 1
    nextIndex = Math.max(0, Math.min(nextCandidates.length - 1, nextIndex))

    set({ candidates: nextCandidates, highlightedIndex: nextIndex })
  },

  commit: (onSelect) => {
    const { open, candidates, highlightedIndex } = get()
    if (!open) return
    const target = candidates[highlightedIndex]
    set({ open: false, candidates: [], highlightedIndex: 0 })
    if (target) onSelect(target)
  },

  close: () => {
    if (!get().open) return
    set({ open: false, candidates: [], highlightedIndex: 0 })
  },
}))
