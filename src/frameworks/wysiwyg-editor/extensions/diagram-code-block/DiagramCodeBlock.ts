import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { ReactNodeViewRenderer } from '@tiptap/react'

import { DiagramCodeBlockNodeView } from './DiagramCodeBlockNodeView'

/**
 * Drop-in replacement for `CodeBlockLowlight` that renders `mermaid` and
 * `chart` code blocks as live diagrams while preserving normal editable,
 * syntax-highlighted code blocks for every other language.
 */
export const DiagramCodeBlock = CodeBlockLowlight.extend({
  addNodeView() {
    return ReactNodeViewRenderer(DiagramCodeBlockNodeView)
  },
})
