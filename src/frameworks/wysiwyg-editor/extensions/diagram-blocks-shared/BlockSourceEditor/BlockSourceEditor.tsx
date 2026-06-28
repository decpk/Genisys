import type { JSX } from 'react'
import { diagramBlockStyles } from '../diagram-block.styles'
import type { BlockSourceEditorProps } from './BlockSourceEditor.types'

/**
 * Raw-source textarea for editing a diagram/chart atom node's `source`.
 * `contentEditable={false}` + key/mouse `stopPropagation` keep ProseMirror
 * from hijacking input while the user edits the underlying mermaid/chart text.
 */
export function BlockSourceEditor(props: BlockSourceEditorProps): JSX.Element {
  const { value, placeholder, onChange } = props
  return (
    <textarea
      value={value}
      placeholder={placeholder}
      spellCheck={false}
      contentEditable={false}
      className={diagramBlockStyles.editor}
      onChange={(event) => onChange(event.target.value)}
      onKeyDown={(event) => event.stopPropagation()}
      onMouseDown={(event) => event.stopPropagation()}
    />
  )
}
