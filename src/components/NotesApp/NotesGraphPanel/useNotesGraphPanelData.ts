import { useRef, useState } from 'react'

import { useNotesAppStore } from '@/store/notes-app-store'

import type { NotesGraphScope, UseNotesGraphPanelDataReturn } from './NotesGraphPanel.types'
import { useNotesGraphData } from './hooks/useNotesGraphData'
import { useNotesGraphSigma } from './hooks/useNotesGraphSigma'

/**
 * Orchestrator hook for the Notes knowledge-graph panel: tracks the local/global
 * scope, builds the graph for the current selection, and mounts Sigma.
 */
export function useNotesGraphPanelData(): UseNotesGraphPanelDataReturn {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [scope, setScope] = useState<NotesGraphScope>('global')
  const selectedNoteId = useNotesAppStore((s) => s.selectedNoteId)

  const { graph } = useNotesGraphData({ scope, selectedNoteId })
  useNotesGraphSigma(containerRef, graph)

  const nodeCount = graph?.order ?? 0
  const isEmpty = graph === null

  return { containerRef, graph, scope, setScope, nodeCount, isEmpty }
}
