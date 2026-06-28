import type {
  StopPredicate,
  StopPredicateContext,
  StopPredicateResult,
} from './predicate.types'

/**
 * Compose multiple `StopPredicate`s — the first one whose `shouldStop` is
 * true wins. Returns a single predicate whose result is the winning
 * predicate's verdict (or a default "don't stop" verdict when none fire).
 */
export function composePredicates(predicates: StopPredicate[]): StopPredicate {
  return (ctx: StopPredicateContext): StopPredicateResult => {
    for (const predicate of predicates) {
      const result = predicate(ctx)
      if (result.shouldStop) return result
    }
    return { shouldStop: false }
  }
}
