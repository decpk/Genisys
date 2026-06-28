import { useEffect } from 'react'

import { useSettingsStore } from '@/store/settings-store'

import { useAutoScrollEngine } from '../../useAutoScrollEngine'
import { useNotesScrollPosition } from '../../useNotesScrollPosition'
import { toSpeedMultiplier } from '../../NotesAutoScrollToolbar/utils/speedConversion'
import type { NotesPaneActiveEffectsProps } from './NotesPaneActiveEffects.types'

/**
 * Side-effects that should only run for the focused note: auto-scroll engine,
 * scroll-position persistence, and the ⇧⌘E view/edit shortcut. Rendered as a
 * child so it can be mounted conditionally (only the active pane mounts it),
 * keeping the shared TOC/scroll context bound to a single editor.
 */
export function NotesPaneActiveEffects(props: NotesPaneActiveEffectsProps): null {
  const { noteId, isReadOnly, onToggleMode } = props

  const notesAutoScrollEnabled = useSettingsStore((s) => s.notesAutoScrollEnabled)
  const notesAutoScrollSpeed = useSettingsStore((s) => s.notesAutoScrollSpeed)
  const notesAutoScrollMode = useSettingsStore((s) => s.notesAutoScrollMode)
  const notesAutoScrollStepPixels = useSettingsStore((s) => s.notesAutoScrollStepPixels)
  const notesAutoScrollStepIntervalMs = useSettingsStore((s) => s.notesAutoScrollStepIntervalMs)

  useAutoScrollEngine({
    isRunning: notesAutoScrollEnabled,
    speedMultiplier: toSpeedMultiplier(notesAutoScrollSpeed),
    mode: notesAutoScrollMode,
    stepPixels: notesAutoScrollStepPixels,
    stepIntervalMs: notesAutoScrollStepIntervalMs,
    isReadOnly,
  })

  useNotesScrollPosition(noteId)

  useEffect(() => {
    const handleModeToggleShortcut = (event: KeyboardEvent) => {
      if (!(event.metaKey && event.shiftKey && event.key.toLowerCase() === 'e')) return
      const target = event.target as HTMLElement | null
      const isTextField =
        target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable
      if (isTextField) return
      event.preventDefault()
      onToggleMode()
    }

    document.addEventListener('keydown', handleModeToggleShortcut)
    return () => document.removeEventListener('keydown', handleModeToggleShortcut)
  }, [onToggleMode])

  return null
}
