import { DecorationSet, Decoration } from '@tiptap/pm/view'
import type { EditorState } from '@tiptap/pm/state'
import type { AiAutocompletePluginState } from '../ai-autocomplete.types'
import { createGhostTextElement } from '../utils/createGhostTextElement'

/**
 * Build a DecorationSet containing a single widget decoration
 * for the ghost text at the cursor position.
 *
 * Returns an empty DecorationSet when there is no active suggestion
 * or the entire suggestion has been accepted.
 */
export function buildDecorationSet(
  state: EditorState,
  pluginState: AiAutocompletePluginState,
): DecorationSet {
  const { suggestion, acceptedLength } = pluginState

  if (!suggestion) return DecorationSet.empty

  const remaining = suggestion.slice(acceptedLength)
  if (!remaining) return DecorationSet.empty

  const cursorPos = state.selection.from
  const widget = Decoration.widget(cursorPos, () => createGhostTextElement(remaining), {
    side: 1, // render after the cursor
    key: 'ai-ghost-text',
  })

  return DecorationSet.create(state.doc, [widget])
}
