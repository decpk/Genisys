import { GraphToolbar } from './components/GraphToolbar'
import {
  NOTES_GRAPH_PANEL_CANVAS_CLASS,
  NOTES_GRAPH_PANEL_EMPTY_CLASS,
  NOTES_GRAPH_PANEL_GRAPH_AREA_CLASS,
  NOTES_GRAPH_PANEL_ROOT_CLASS,
} from './NotesGraphPanel.styles'
import { useNotesGraphPanelData } from './useNotesGraphPanelData'

export function NotesGraphPanel(): React.JSX.Element {
  const { containerRef, scope, setScope, nodeCount, isEmpty } = useNotesGraphPanelData()

  let emptyOverlay: React.ReactNode = null
  if (isEmpty) {
    emptyOverlay = (
      <div className={NOTES_GRAPH_PANEL_EMPTY_CLASS}>
        No links yet — type [[ in a note to connect ideas
      </div>
    )
  }

  return (
    <div className={NOTES_GRAPH_PANEL_ROOT_CLASS}>
      <GraphToolbar scope={scope} onScopeChange={setScope} nodeCount={nodeCount} />
      <div className={NOTES_GRAPH_PANEL_GRAPH_AREA_CLASS}>
        <div ref={containerRef} className={NOTES_GRAPH_PANEL_CANVAS_CLASS} />
        {emptyOverlay}
      </div>
    </div>
  )
}
