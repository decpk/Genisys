import { Extension } from '@tiptap/react'
import { showInlinePrompt } from './plugin/showInlinePrompt'
import type { AiInlineWriterOptions } from './ai-inline-writer.types'

/**
 * TipTap extension for inline AI writing.
 *
 * - Cmd/Ctrl + J opens a floating prompt input at the cursor
 * - User types a writing instruction and presses Enter
 * - AI streams content directly into the editor at the cursor position
 * - Escape dismisses the prompt
 * - Can also be triggered from the /ai slash command
 */
export const AiInlineWriter = Extension.create<AiInlineWriterOptions>({
  name: 'aiInlineWriter',

  addOptions() {
    return {
      shortcut: 'Mod-j',
    }
  },

  addKeyboardShortcuts() {
    return {
      [this.options.shortcut]: () => {
        showInlinePrompt(this.editor)
        return true
      },
    }
  },
})
