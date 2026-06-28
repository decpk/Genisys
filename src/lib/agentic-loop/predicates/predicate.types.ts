import type {
  AgenticLoopCallbacks,
  CompletionResult,
  LoopState,
} from '../agenticLoop.types'

/** Why the loop decided to stop. */
export type StopReason =
  | 'cancelled'
  | 'no-new-tool-calls'
  | 'finish-reason-stop-with-content'
  | 'repeated-tool-call'
  | 'consecutive-tool-errors'
  | 'max-iterations'

/** What predicates inspect to decide whether the loop should stop. */
export interface StopPredicateContext {
  state: LoopState
  /** Result of the most recent completion call (when available). */
  lastResult?: CompletionResult
  /** Hash of the last tool call we attempted (when available). */
  lastToolHash?: string
  /** Loop callbacks — predicates may forward terminal info to them. */
  callbacks?: AgenticLoopCallbacks
}

/** Predicate verdict. */
export interface StopPredicateResult {
  shouldStop: boolean
  reason?: StopReason
  /** Optional final assistant content to surface to `onDone`. */
  finalContent?: string
  /** Optional error message to surface to `onError`. */
  errorMessage?: string
}

/** Predicate signature. Pure function — no side effects. */
export type StopPredicate = (ctx: StopPredicateContext) => StopPredicateResult
