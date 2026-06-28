import type { JSX } from 'react'
import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react'
import { Code2, Eye } from 'lucide-react'
import { RechartsViewer } from '@/components/ui/markdown-renderer/RechartsViewer'
import { BlockSourceEditor } from '../diagram-blocks-shared/BlockSourceEditor'
import { diagramBlockStyles } from '../diagram-blocks-shared/diagram-block.styles'
import { useDiagramBlockNodeViewData } from '../diagram-blocks-shared/useDiagramBlockNodeViewData'

/** Live preview + raw-source editor for a `chartBlock` atom node. */
export function ChartBlockNodeView(props: NodeViewProps): JSX.Element {
  const { source, showSource, toggleSource, onSourceChange } =
    useDiagramBlockNodeViewData(props)
  const editable = props.editor.isEditable
  const isEditing = showSource && editable

  const ToggleIcon = showSource ? Eye : Code2
  const toggleLabel = showSource ? 'Preview' : 'Edit'

  let body: JSX.Element
  if (isEditing) {
    body = (
      <BlockSourceEditor
        value={source}
        placeholder='{ "type": "bar", "data": [] }'
        onChange={onSourceChange}
      />
    )
  } else {
    body = (
      <div contentEditable={false} className={diagramBlockStyles.preview}>
        <RechartsViewer spec={source} />
      </div>
    )
  }

  return (
    <NodeViewWrapper
      as="div"
      data-chart-block=""
      className={diagramBlockStyles.wrapper}
    >
      <div contentEditable={false} className={diagramBlockStyles.header}>
        <span className={diagramBlockStyles.badge}>chart</span>
        {editable && (
          <button
            type="button"
            onClick={toggleSource}
            className={diagramBlockStyles.toggle}
          >
            <ToggleIcon size={10} />
            <span>{toggleLabel}</span>
          </button>
        )}
      </div>
      {body}
    </NodeViewWrapper>
  )
}
