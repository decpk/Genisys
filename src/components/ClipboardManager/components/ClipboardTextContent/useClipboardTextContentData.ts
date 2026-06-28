import { useMemo } from 'react'
import { useSettingsStore } from '@/store/settings-store'
import {
  resolveClipboardCodeRendering,
  type ClipboardCodeRenderingDecision,
} from '../../utils/resolveClipboardCodeRendering'

interface UseClipboardTextContentDataArgs {
  text: string
  displayText: string
}

/**
 * Reads the syntax-highlight setting from the store and resolves whether the
 * given clipboard text should be highlighted. Masking is detected via the
 * `text !== displayText` invariant — callers don't need to pass an explicit
 * `isMasked` flag.
 */
export function useClipboardTextContentData(
  args: UseClipboardTextContentDataArgs,
): ClipboardCodeRenderingDecision {
  const { text, displayText } = args
  const settingEnabled = useSettingsStore((s) => s.clipboardSyntaxHighlightCode)
  const isMasked = text !== displayText

  return useMemo(
    () => resolveClipboardCodeRendering({ rawText: text, isMasked, settingEnabled }),
    [text, isMasked, settingEnabled],
  )
}
