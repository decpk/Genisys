import { useShikiTheme } from './useShikiTheme'
import { useShikiHighlight } from './useShikiHighlight'

interface UseClipboardCodeViewDataArgs {
  code: string
  lang: string
}

/**
 * Orchestrator hook for `ClipboardCodeView`. Composes:
 *   - `useShikiTheme`     — singleton dark-mode tracker
 *   - `useShikiHighlight` — async Shiki resolution + module-level cache
 */
export function useClipboardCodeViewData(args: UseClipboardCodeViewDataArgs): { html: string } {
  const { code, lang } = args
  const isDark = useShikiTheme()
  const { html } = useShikiHighlight({ code, lang, isDark })
  return { html }
}
