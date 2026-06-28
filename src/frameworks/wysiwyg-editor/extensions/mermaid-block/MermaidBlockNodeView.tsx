import type { JSX } from 'react'
import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react'
import { Code2, Eye } from 'lucide-react'
import { MermaidViewer } from '@/components/MermaidViewer'
import { BlockSourceEditor } from '../diagram-blocks-shared/BlockSourceEditor'
import { diagramBlockStyles } from '../diagram-blocks-shared/diagram-block.styles'
import { useDiagramBlockNodeViewData } from '../diagram-blocks-shared/useDiagramBlockNodeViewData'

/** Live preview + raw-source editor for a `mermaidBlock` atom node. */
export function MermaidBlockNodeView(props: NodeViewProps): JSX.Element {
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
        placeholder="graph TD&#10;  A[Start] --> B[End]"
        onChange={onSourceChange}
      />
    )
  } else {
    body = (
      <div contentEditable={false} className={diagramBlockStyles.preview}>
        <MermaidViewer chart={source} />
      </div>
    )
  }

  return (
    <NodeViewWrapper
      as="div"
      data-mermaid-block=""
      className={diagramBlockStyles.wrapper}
    >
      <div contentEditable={false} className={diagramBlockStyles.header}>
        <span className={diagramBlockStyles.badge}>mermaid</span>
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
