import type { MultiDirectedGraph } from 'graphology'

export type NotesGraphScope = 'local' | 'global'

export interface NotesGraphNodeAttrs {
  label: string
  size: number
  color: string
  x: number
  y: number
}

export type NotesGraphEdgeAttrs = Record<string, never>

export type NotesGraphMultiGraph = MultiDirectedGraph<NotesGraphNodeAttrs, NotesGraphEdgeAttrs>

export interface UseNotesGraphPanelDataReturn {
  containerRef: React.RefObject<HTMLDivElement | null>
  graph: NotesGraphMultiGraph | null
  scope: NotesGraphScope
  setScope: (scope: NotesGraphScope) => void
  nodeCount: number
  isEmpty: boolean
}
