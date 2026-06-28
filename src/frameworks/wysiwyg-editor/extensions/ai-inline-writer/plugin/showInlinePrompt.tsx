import type { Editor } from '@tiptap/react'
import { createRoot, type Root } from 'react-dom/client'
import { AIInlinePrompt } from '../components/AIInlinePrompt'
import { computePromptPosition } from '../utils/computePromptPosition'

let activeContainer: HTMLDivElement | null = null
let activeRoot: Root | null = null

export function showInlinePrompt(editor: Editor): void {
  // If already open, close it first (toggle behavior)
  if (activeContainer) {
    dismissInlinePrompt()
    return
  }

  const { from } = editor.state.selection
  const coords = editor.view.coordsAtPos(from)
  const position = computePromptPosition(coords)

  const container = document.createElement('div')
  container.className = 'ai-inline-writer-portal'
  document.body.appendChild(container)
  activeContainer = container

  const root = createRoot(container)
  activeRoot = root

  const handleClose = (): void => {
    dismissInlinePrompt()
    editor.commands.focus()
  }

  root.render(
    <AIInlinePrompt
      editor={editor}
      cursorPos={from}
      onClose={handleClose}
      position={position}
    />,
  )
}

export function dismissInlinePrompt(): void {
  if (activeRoot) {
    activeRoot.unmount()
    activeRoot = null
  }
  if (activeContainer) {
    activeContainer.remove()
    activeContainer = null
  }
}

export function isInlinePromptOpen(): boolean {
  return activeContainer !== null
}
