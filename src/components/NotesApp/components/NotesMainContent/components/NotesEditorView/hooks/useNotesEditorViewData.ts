import { useCallback, useState } from 'react'

import { useNoteHighlightsStore } from '@/store/note-highlights-store'
import { useSettingsStore } from '@/store/settings-store'

import { useWikiLinkConfig } from '../../../../../notes-links'
import { useNotesToc } from '../../../../../NotesTocProvider'
import { useNotesHighlightSync } from '../../../../../NotesHighlightsPanel/useNotesHighlightSync'
import type { NotesEditorViewProps } from '../NotesEditorView.types'
import { useNotesScrollProgress } from './useNotesScrollProgress'

/**
 * Logic for a single note's editor surface: highlight persistence, label popover
 * state, per-document scroll-progress tracking, and (only when this pane is the
 * TOC source) registering the editor + scroll container with the shared Notes TOC
 * context. The scroll container is bound via a combined callback ref so progress
 * tracking works in every pane while TOC registration stays active-pane only.
 */
export function useNotesEditorViewData(props: NotesEditorViewProps) {
  const { note, noteLabels, allLabels, sourceInfo, showLabels, isTocSource } = props

  const [labelPopoverOpen, setLabelPopoverOpen] = useState(false)
  const activeLabelIds = new Set(note.labels ?? [])

  const { editor, registerEditor, registerScrollContainer } = useNotesToc()
  const { scrollRef, progressBarRef, percentLabelRef } = useNotesScrollProgress({ noteId: note.id })
  const wikiLinkConfig = useWikiLinkConfig()

  const showScrollPercentage = useSettingsStore((s) => s.showScrollPercentage)
  const showScrollProgressBar = useSettingsStore((s) => s.showScrollProgressBar)

  useNotesHighlightSync(editor, note.id)

  const addHighlight = useNoteHighlightsStore((s) => s.addHighlight)
  const removeHighlightsInRange = useNoteHighlightsStore((s) => s.removeHighlightsInRange)

  const handleHighlightApplied = useCallback(
    (text: string, from: number, to: number) => {
      void addHighlight({ noteId: note.id, text, fromPos: from, toPos: to })
    },
    [addHighlight, note.id],
  )

  const handleHighlightRemoved = useCallback(
    (from: number, to: number) => {
      void removeHighlightsInRange(note.id, from, to)
    },
    [removeHighlightsInRange, note.id],
  )

  const handleEditorReady = isTocSource ? registerEditor : undefined

  const setScrollEl = useCallback(
    (el: HTMLDivElement | null) => {
      scrollRef.current = el
      if (isTocSource) registerScrollContainer(el)
    },
    [isTocSource, registerScrollContainer, scrollRef],
  )

  const hasHeader = !!sourceInfo || (showLabels && (noteLabels.length > 0 || allLabels.length > 0))

  return {
    labelPopoverOpen,
    setLabelPopoverOpen,
    activeLabelIds,
    handleHighlightApplied,
    handleHighlightRemoved,
    handleEditorReady,
    setScrollEl,
    progressBarRef,
    percentLabelRef,
    hasHeader,
    wikiLinkConfig,
    showScrollPercentage,
    showScrollProgressBar,
  }
}
