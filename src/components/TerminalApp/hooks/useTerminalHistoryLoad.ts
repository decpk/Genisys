import { useEffect } from 'react'

import { useSettingsStore } from '@/store/settings-store'
import { useTerminalHistoryStore } from '@/store/terminal-history-store'

/**
 * Loads the user's shell command history once the Terminal app mounts (and
 * whenever history autocomplete is turned on), so ghost-text + dropdown
 * suggestions are ready the moment the user starts typing. Idempotent — the
 * store guards against repeat loads.
 */
export function useTerminalHistoryLoad(): void {
  const enabled = useSettingsStore((s) => s.terminalHistoryAutocomplete)
  useEffect(() => {
    if (enabled) void useTerminalHistoryStore.getState().load()
  }, [enabled])
}
