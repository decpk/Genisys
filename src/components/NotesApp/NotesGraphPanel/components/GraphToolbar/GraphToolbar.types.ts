import type { NotesGraphScope } from '../../NotesGraphPanel.types'

export interface GraphToolbarProps {
  scope: NotesGraphScope
  onScopeChange: (scope: NotesGraphScope) => void
  nodeCount: number
}
