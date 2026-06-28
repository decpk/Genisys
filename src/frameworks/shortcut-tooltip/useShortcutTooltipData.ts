import { useShortcuts } from '@/frameworks/keyboard-shortcut'

// ── Return type ──────────────────────────────────────────────────────

interface UseShortcutTooltipDataReturn {
  shortcutKeys: string | undefined
}

// ── Hook ─────────────────────────────────────────────────────────────

export function useShortcutTooltipData(shortcutId: string): UseShortcutTooltipDataReturn {
  const { shortcuts } = useShortcuts()

  const resolved = shortcuts.find((s) => s.id === shortcutId)

  if (!resolved || resolved.isDisabled) {
    return { shortcutKeys: undefined }
  }

  return { shortcutKeys: resolved.keys }
}
