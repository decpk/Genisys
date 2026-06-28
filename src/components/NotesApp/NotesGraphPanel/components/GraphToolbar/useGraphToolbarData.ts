import { useCallback } from 'react'

import type { NotesGraphScope } from '../../NotesGraphPanel.types'
import type { GraphToolbarProps } from './GraphToolbar.types'

export interface UseGraphToolbarDataReturn {
  scope: NotesGraphScope
  nodeCount: number
  selectLocal: () => void
  selectGlobal: () => void
}

/** Derive the toolbar's view state and scope handlers from props. */
export function useGraphToolbarData(props: GraphToolbarProps): UseGraphToolbarDataReturn {
  const { scope, onScopeChange, nodeCount } = props

  const selectLocal = useCallback(() => onScopeChange('local'), [onScopeChange])
  const selectGlobal = useCallback(() => onScopeChange('global'), [onScopeChange])

  return { scope, nodeCount, selectLocal, selectGlobal }
}
