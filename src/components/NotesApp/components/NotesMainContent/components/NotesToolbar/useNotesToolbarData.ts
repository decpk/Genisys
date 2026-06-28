import { useCallback, useEffect, useRef, useState } from 'react'

import { useSettingsStore } from '@/store/settings-store'

const COMPACT_BREAKPOINT = 768

/**
 * Toolbar concerns that are not pane-specific: responsive compaction via a
 * ResizeObserver and the global "show labels" toggle.
 */
export function useNotesToolbarData() {
  const toolbarRef = useRef<HTMLDivElement | null>(null)
  const [isCompact, setIsCompact] = useState(false)

  useEffect(() => {
    const el = toolbarRef.current
    if (!el) return

    const update = () => setIsCompact(el.clientWidth < COMPACT_BREAKPOINT)
    update()

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', update)
      return () => window.removeEventListener('resize', update)
    }

    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const handleToggleLabels = useCallback(() => {
    const s = useSettingsStore.getState()
    s.setNotesShowLabels(!s.notesShowLabels)
  }, [])

  return { toolbarRef, isCompact, handleToggleLabels }
}
