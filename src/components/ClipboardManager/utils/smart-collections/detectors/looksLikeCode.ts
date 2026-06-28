import { detectCode } from './detectCode'
import {
  hasMethodCall,
  hasMethodChain,
  hasConstructorCall,
  hasArrowFunction,
  hasStrictEquality,
  hasTemplateInterpolation,
  hasTypeAnnotation,
  hasAngleGeneric,
  hasSemiTerminatedAssignment,
} from './code-signals'

const SIGNAL_CHECKS: ReadonlyArray<(text: string) => boolean> = [
  hasConstructorCall,
  hasMethodChain,
  hasMethodCall,
  hasArrowFunction,
  hasTemplateInterpolation,
  hasTypeAnnotation,
  hasAngleGeneric,
  hasStrictEquality,
  hasSemiTerminatedAssignment,
]

/**
 * Permissive code detector for the **syntax-highlight rendering path**.
 *
 * Returns true when the strict `detectCode` returns true OR the text matches
 * any single strong code signal (constructor call, method chain, arrow
 * function, template interpolation, etc).
 *
 * `detectCode` is intentionally conservative because it drives the smart-
 * collection "Code Snippets" badge — false positives there are noisy. Visual
 * highlighting tolerates a wider net, so this helper exists alongside it.
 */
export function looksLikeCode(text: string): boolean {
  if (!text || text.length < 4) return false
  if (detectCode(text)) return true

  for (const check of SIGNAL_CHECKS) {
    if (check(text)) return true
  }
  return false
}
