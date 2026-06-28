import { Plugin, PluginKey } from '@tiptap/pm/state'
import type { EditorView } from '@tiptap/pm/view'
import type { AiAutocompleteOptions, AiAutocompletePluginState } from '../ai-autocomplete.types'
import { createInitialState, applyPluginState } from './pluginState'
import { buildDecorationSet } from './decorationFactory'
import { extractContext } from '../utils/extractContext'
import { shouldTriggerAutocomplete } from '../utils/shouldTriggerAutocomplete'
import { findNextWordBoundary } from '../utils/findNextWordBoundary'
import { fetchAICompletion } from '../api/fetchAICompletion'
import { resolveAppModel } from '@/lib/resolveAppModel'

export const aiAutocompletePluginKey = new PluginKey<AiAutocompletePluginState>('aiAutocomplete')

/**
 * Create the ProseMirror plugin that powers AI inline autocomplete.
 *
 * Responsibilities:
 * - Debounced trigger on text changes → AI completion request
 * - Ghost text rendering via decorations
 * - Tab (accept all), Cmd/Ctrl+Right (accept word), Escape (dismiss)
 * - Request cancellation via AbortController + requestId
 */
export function createAiAutocompletePlugin(options: AiAutocompleteOptions): Plugin {
  let debounceTimer: ReturnType<typeof setTimeout> | null = null
  let abortController: AbortController | null = null
  let currentRequestId = 0

  function cleanup() {
    if (debounceTimer !== null) {
      clearTimeout(debounceTimer)
      debounceTimer = null
    }
    if (abortController) {
      abortController.abort()
      abortController = null
    }
  }

  function scheduleCompletion(view: EditorView) {
    cleanup()

    // Never trigger autocomplete in read-only/view mode. The extension stays
    // loaded across edit↔view toggles (so the editor never remounts), so this
    // runtime guard is what keeps ghost text out of view mode.
    if (!view.editable) return

    // Don't schedule if there's an active suggestion (e.g. mid word-by-word accept)
    const currentPluginState = aiAutocompletePluginKey.getState(view.state)
    if (currentPluginState?.suggestion) return

    const context = extractContext(view.state, options.maxContextLength)
    if (!shouldTriggerAutocomplete(view.state, context, options.minContextLength)) return

    debounceTimer = setTimeout(async () => {
      const requestId = ++currentRequestId
      abortController = new AbortController()

      const suggestion = await fetchAICompletion(context, resolveAppModel('chat'), abortController.signal)
      abortController = null

      // Discard if stale (user typed while request was in-flight)
      if (requestId !== currentRequestId) return
      if (!suggestion) return
      // Verify the view is still valid
      if (view.isDestroyed) return

      const { from } = view.state.selection
      const tr = view.state.tr.setMeta(aiAutocompletePluginKey, {
        type: 'set-suggestion',
        suggestion,
        anchorPos: from,
        requestId,
      })
      view.dispatch(tr)
    }, options.debounceMs)
  }

  return new Plugin<AiAutocompletePluginState>({
    key: aiAutocompletePluginKey,

    state: {
      init: createInitialState,
      apply(tr, prev) {
        return applyPluginState(prev, tr, aiAutocompletePluginKey)
      },
    },

    props: {
      decorations(state) {
        const pluginState = aiAutocompletePluginKey.getState(state)
        if (!pluginState) return undefined
        return buildDecorationSet(state, pluginState)
      },

      handleKeyDown(view, event) {
        const pluginState = aiAutocompletePluginKey.getState(view.state)
        if (!pluginState?.suggestion) return false

        const remaining = pluginState.suggestion.slice(pluginState.acceptedLength)
        if (!remaining) return false

        // ── Tab → accept all remaining ──
        if (event.key === 'Tab' && !event.shiftKey && !event.ctrlKey && !event.metaKey && !event.altKey) {
          event.preventDefault()

          const { from } = view.state.selection
          const tr = view.state.tr
            .insertText(remaining, from)
            .setMeta(aiAutocompletePluginKey, { type: 'accept-all' })
          view.dispatch(tr)
          return true
        }

        // ── Cmd/Ctrl + Right Arrow → accept next word ──
        if (event.key === 'ArrowRight' && (event.metaKey || event.ctrlKey) && !event.shiftKey && !event.altKey) {
          event.preventDefault()

          const wordLen = findNextWordBoundary(remaining)
          if (wordLen === 0) return false

          const wordChunk = remaining.slice(0, wordLen)
          const newAcceptedLength = pluginState.acceptedLength + wordLen
          const isFullyAccepted = newAcceptedLength >= pluginState.suggestion!.length

          const { from } = view.state.selection
          const tr = view.state.tr.insertText(wordChunk, from)

          if (isFullyAccepted) {
            tr.setMeta(aiAutocompletePluginKey, { type: 'accept-all' })
          } else {
            tr.setMeta(aiAutocompletePluginKey, {
              type: 'accept-word',
              acceptedLength: newAcceptedLength,
              anchorPos: from + wordLen,
            })
          }

          view.dispatch(tr)
          return true
        }

        // ── Escape → dismiss ──
        if (event.key === 'Escape') {
          event.preventDefault()
          const tr = view.state.tr.setMeta(aiAutocompletePluginKey, { type: 'dismiss' })
          view.dispatch(tr)
          return true
        }

        return false
      },
    },

    view() {
      return {
        update(view, prevState) {
          // When the editor switches to read-only/view mode, cancel any pending
          // request and dismiss the active ghost text so it never lingers there.
          if (!view.editable) {
            cleanup()
            const pluginState = aiAutocompletePluginKey.getState(view.state)
            if (pluginState?.suggestion) {
              const tr = view.state.tr.setMeta(aiAutocompletePluginKey, { type: 'dismiss' })
              view.dispatch(tr)
            }
            return
          }

          // Only schedule a new completion when the document content changed
          if (!view.state.doc.eq(prevState.doc)) {
            scheduleCompletion(view)
          }
        },
        destroy() {
          cleanup()
        },
      }
    },
  })
}
