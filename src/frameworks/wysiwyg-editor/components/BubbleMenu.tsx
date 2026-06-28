import { BubbleMenu as TiptapBubbleMenu } from '@tiptap/react/menus'
import type { Editor } from '@tiptap/react'

interface EditorBubbleMenuProps {
  editor: Editor
  onHighlightApplied?: (text: string, from: number, to: number) => void
  onHighlightRemoved?: (from: number, to: number) => void
}

export function EditorBubbleMenu({ editor, onHighlightApplied, onHighlightRemoved }: EditorBubbleMenuProps) {
  return (
    <TiptapBubbleMenu
      editor={editor}
      tippyOptions={{ duration: 150, placement: 'top', appendTo: () => document.body }}
      className="bubble-menu"
    >
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive('bold') ? 'is-active' : ''}
        title="Bold (⌘B)"
      >
        B
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive('italic') ? 'is-active' : ''}
        title="Italic (⌘I)"
      >
        I
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={editor.isActive('underline') ? 'is-active' : ''}
        title="Underline (⌘U)"
      >
        U
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={editor.isActive('strike') ? 'is-active' : ''}
        title="Strikethrough"
      >
        S
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={editor.isActive('code') ? 'is-active' : ''}
        title="Inline code (⌘E)"
      >
        {'</>'}
      </button>
      <button
        type="button"
        onClick={() => {
          const { from, to } = editor.state.selection
          const text = editor.state.doc.textBetween(from, to, ' ')
          const wasActive = editor.isActive('highlight')
          editor.chain().focus().toggleHighlight().run()
          if (!wasActive) {
            if (text.trim()) onHighlightApplied?.(text, from, to)
          } else {
            onHighlightRemoved?.(from, to)
          }
        }}
        className={editor.isActive('highlight') ? 'is-active' : ''}
        title="Highlight"
      >
        H
      </button>
      <button
        type="button"
        onClick={() => {
          const url = window.prompt('Enter URL')
          if (url) {
            editor.chain().focus().setLink({ href: url }).run()
          }
        }}
        className={editor.isActive('link') ? 'is-active' : ''}
        title="Link"
      >
        🔗
      </button>
    </TiptapBubbleMenu>
  )
}
