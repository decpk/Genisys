import { useEffect } from 'react'
import Sigma from 'sigma'

import { useNotesAppStore } from '@/store/notes-app-store'

import type { NotesGraphMultiGraph } from '../NotesGraphPanel.types'

/**
 * Mount a Sigma renderer onto `containerRef` for the given graph. Wires
 * node-click to select the corresponding note and re-creates the instance
 * whenever the graph identity changes. Always kills Sigma on cleanup.
 */
export function useNotesGraphSigma(
  containerRef: React.RefObject<HTMLDivElement | null>,
  graph: NotesGraphMultiGraph | null,
): void {
  useEffect(() => {
    const container = containerRef.current
    if (!container || !graph) return

    const instance = new Sigma(graph, container, {
      renderLabels: true,
      labelDensity: 0.4,
      labelGridCellSize: 80,
      labelRenderedSizeThreshold: 6,
      defaultEdgeColor: 'rgba(148, 163, 184, 0.45)',
      defaultNodeColor: '#64748b',
      allowInvalidContainer: true,
    })

    instance.on('clickNode', ({ node }) => {
      useNotesAppStore.getState().setSelectedNoteId(node)
    })

    return () => {
      instance.kill()
    }
  }, [containerRef, graph])
}
