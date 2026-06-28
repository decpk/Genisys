import {
  GRAPH_TOOLBAR_COUNT_CLASS,
  GRAPH_TOOLBAR_GROUP_CLASS,
  GRAPH_TOOLBAR_ROOT_CLASS,
  graphToolbarButtonClass,
} from './GraphToolbar.styles'
import type { GraphToolbarProps } from './GraphToolbar.types'
import { useGraphToolbarData } from './useGraphToolbarData'

export function GraphToolbar(props: GraphToolbarProps): React.JSX.Element {
  const { scope, nodeCount, selectLocal, selectGlobal } = useGraphToolbarData(props)
  return (
    <div className={GRAPH_TOOLBAR_ROOT_CLASS}>
      <div className={GRAPH_TOOLBAR_GROUP_CLASS}>
        <button
          type="button"
          className={graphToolbarButtonClass(scope === 'local')}
          onClick={selectLocal}
        >
          Local
        </button>
        <button
          type="button"
          className={graphToolbarButtonClass(scope === 'global')}
          onClick={selectGlobal}
        >
          Global
        </button>
      </div>
      <span className={GRAPH_TOOLBAR_COUNT_CLASS}>{nodeCount} nodes</span>
    </div>
  )
}
