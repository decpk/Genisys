/**
 * Strongly-typed shape returned by `cmd_git_operation_state`.
 *
 * Mirrors the on-disk markers under `.git/` that track multi-step git
 * operations. The LLM uses this to choose between `*_continue`,
 * `*_abort`, and `*_skip` tools when resuming a flow.
 */
export interface GitOperationState {
  /** True iff a merge is in progress (`.git/MERGE_HEAD` present). */
  mergeInProgress: boolean
  /** True iff a rebase is in progress (`.git/rebase-merge` or `.git/rebase-apply`). */
  rebaseInProgress: boolean
  /** True iff a cherry-pick is in progress (`.git/CHERRY_PICK_HEAD`). */
  cherryPickInProgress: boolean
  /** True iff a revert is in progress (`.git/REVERT_HEAD`). */
  revertInProgress: boolean
  /** True iff a bisect is in progress (`.git/BISECT_LOG` present). */
  bisectInProgress: boolean
  /** True iff an interactive `am`/patch session is in progress. */
  amInProgress: boolean
  /** True iff the working tree has any conflicted (`UU`/`AA`/...) entry. */
  hasConflicts: boolean
}

/**
 * Defensive parser for backend payloads. Coerces any truthy/falsy
 * shape into strict booleans and fills unknown fields with `false`.
 */
export function parseOperationState(raw: unknown): GitOperationState {
  const r = (raw ?? {}) as Record<string, unknown>
  const bool = (v: unknown): boolean => v === true
  return {
    mergeInProgress: bool(r.mergeInProgress),
    rebaseInProgress: bool(r.rebaseInProgress),
    cherryPickInProgress: bool(r.cherryPickInProgress),
    revertInProgress: bool(r.revertInProgress),
    bisectInProgress: bool(r.bisectInProgress),
    amInProgress: bool(r.amInProgress),
    hasConflicts: bool(r.hasConflicts),
  }
}
