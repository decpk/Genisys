import { Extension } from '@tiptap/react'
import { createAiAutocompletePlugin } from './plugin/aiAutocompletePlugin'
import type { AiAutocompleteOptions } from './ai-autocomplete.types'

/**
 * TipTap extension that provides VS Code-style AI inline autocomplete.
 *
 * - Ghost text appears after cursor when user pauses typing
 * - Tab accepts the full suggestion
 * - Cmd/Ctrl + Right Arrow accepts word-by-word
 * - Escape dismisses
 * - Typing or cursor movement dismisses and re-triggers
 */
export const AiAutocomplete = Extension.create<AiAutocompleteOptions>({
  name: 'aiAutocomplete',

  addOptions() {
    return {
      debounceMs: 400,
      maxContextLength: 500,
      minContextLength: 20,
    }
  },

  addProseMirrorPlugins() {
    return [
      createAiAutocompletePlugin({
        debounceMs: this.options.debounceMs,
        maxContextLength: this.options.maxContextLength,
        minContextLength: this.options.minContextLength,
      }),
    ]
  },
})
