import type { EditorState } from '@tiptap/pm/state'
import { WysiwygSlashCommandPluginKey } from '../../slash-command'

/**
 * Determine whether the autocomplete should trigger for the current editor state.
 *
 * Returns `false` (skip) when:
 * - Selection is not collapsed (text is selected)
 * - Cursor is inside a code block
 * - Slash command menu is currently active
 * - Not enough context text (below minContextLength)
 * - The current line is blank / whitespace-only
 */
export function shouldTriggerAutocomplete(
  state: EditorState,
  contextText: string,
  minContextLength: number,
): boolean {
  const { selection } = state
  if (!selection.empty) return false

  // Check if cursor is inside a code block
  const $from = state.selection.$from
  const parentNodeType = $from.parent.type.name
  if (parentNodeType === 'codeBlock') return false

  // Check if slash command menu is open
  const slashState = WysiwygSlashCommandPluginKey.getState(state)
  if (slashState?.active) return false

  // Require minimum context
  if (contextText.length < minContextLength) return false

  // Skip if the last line is blank (user hasn't started a thought)
  const lastLine = contextText.split('\n').pop() ?? ''
  if (lastLine.trim().length === 0) return false

  return true
}
