import { EditorContent } from '@tiptap/react'
import { useWysiwygEditorData } from './useWysiwygEditorData'
import { EditorBubbleMenu } from './components/BubbleMenu'
import { wysiwygEditorStyles } from './WysiwygEditor.styles'
import type { WysiwygEditorProps } from './WysiwygEditor.types'

import './wysiwyg-editor.css'
import './extensions/ai-autocomplete/ai-autocomplete.css'

function WysiwygEditor(props: WysiwygEditorProps) {
  const { readOnly, className, style, onHighlightApplied, onHighlightRemoved } = props
  const { editor, containerRef } = useWysiwygEditorData(props)

  const rootClassName = className
    ? `${wysiwygEditorStyles.root} ${className}`
    : wysiwygEditorStyles.root

  return (
    <div ref={containerRef} className={rootClassName} style={style} data-selection-toolbar>
      {editor && !readOnly && (
        <EditorBubbleMenu
          editor={editor}
          onHighlightApplied={onHighlightApplied}
          onHighlightRemoved={onHighlightRemoved}
        />
      )}
      <EditorContent
        editor={editor}
        className={wysiwygEditorStyles.editorContainer}
      />
    </div>
  )
}

export { WysiwygEditor }
