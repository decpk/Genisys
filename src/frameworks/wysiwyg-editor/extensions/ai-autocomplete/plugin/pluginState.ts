import type { AiAutocompletePluginState, AiAutocompleteMeta } from '../ai-autocomplete.types'
import type { Transaction } from '@tiptap/pm/state'

/** Initial state for the plugin. */
export function createInitialState(): AiAutocompletePluginState {
  return {
    suggestion: null,
    acceptedLength: 0,
    anchorPos: 0,
    requestId: 0,
  }
}

/**
 * Reduce plugin state based on meta actions dispatched via `tr.setMeta()`.
 * If no meta is present but the document changed, dismiss the active suggestion.
 */
export function applyPluginState(
  prev: AiAutocompletePluginState,
  tr: Transaction,
  pluginKey: any,
): AiAutocompletePluginState {
  const meta: AiAutocompleteMeta | undefined = tr.getMeta(pluginKey)

  if (meta) {
    switch (meta.type) {
      case 'set-suggestion':
        return {
          suggestion: meta.suggestion,
          acceptedLength: 0,
          anchorPos: meta.anchorPos,
          requestId: meta.requestId,
        }

      case 'accept-all':
      case 'dismiss':
        return createInitialState()

      case 'accept-word':
        return {
          ...prev,
          acceptedLength: meta.acceptedLength,
          anchorPos: meta.anchorPos,
        }
    }
  }

  // If the document changed (user typed), dismiss the current suggestion
  if (tr.docChanged && prev.suggestion) {
    return createInitialState()
  }

  // Map the anchor position through any document changes
  if (tr.docChanged && prev.anchorPos > 0) {
    return {
      ...prev,
      anchorPos: tr.mapping.map(prev.anchorPos),
    }
  }

  return prev
}
