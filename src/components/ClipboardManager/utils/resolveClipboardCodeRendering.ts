import { looksLikeCode } from './smart-collections/detectors/looksLikeCode'
import { guessLanguage } from './smart-collections/detectors/language-guessers/guessLanguage'

export interface ClipboardCodeRenderingDecision {
  /** When true, the caller should render the text via `ClipboardCodeView`. */
  shouldHighlight: boolean
  /**
   * Shiki language id to use when `shouldHighlight` is true.
   * Falls back to `'javascript'` when the guesser can't decide.
   * Empty string when `shouldHighlight` is false.
   */
  lang: string
}

/**
 * Pure decision function: given a clipboard text item, decide whether it should
 * be rendered with syntax highlighting and which language to use.
 *
 * Highlighting is skipped when:
 *   - The user's `clipboardSyntaxHighlightCode` setting is disabled.
 *   - The text is empty.
 *   - The text was masked (sensitive content — masked placeholders are not code).
 *   - The text doesn't pass `looksLikeCode`.
 */
export function resolveClipboardCodeRendering(args: {
  rawText: string
  isMasked: boolean
  settingEnabled: boolean
}): ClipboardCodeRenderingDecision {
  const { rawText, isMasked, settingEnabled } = args

  if (!settingEnabled) return { shouldHighlight: false, lang: '' }
  if (!rawText) return { shouldHighlight: false, lang: '' }
  if (isMasked) return { shouldHighlight: false, lang: '' }
  if (!looksLikeCode(rawText)) return { shouldHighlight: false, lang: '' }

  const lang = guessLanguage(rawText) ?? 'javascript'
  return { shouldHighlight: true, lang }
}
