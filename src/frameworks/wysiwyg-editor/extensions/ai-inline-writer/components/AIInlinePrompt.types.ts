import type { Editor } from '@tiptap/react'

export interface PromptPosition {
  top: number
  left: number
}

export interface AIInlinePromptProps {
  editor: Editor
  cursorPos: number
  onClose: () => void
  position: PromptPosition
}
