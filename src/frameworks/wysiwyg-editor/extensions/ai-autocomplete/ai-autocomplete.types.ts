/** State held by the AI autocomplete ProseMirror plugin. */
export interface AiAutocompletePluginState {
  /** The full suggestion text returned by AI. `null` when inactive. */
  suggestion: string | null
  /** How many characters of `suggestion` have been accepted (word-by-word). */
  acceptedLength: number
  /** Document position where the suggestion was anchored. */
  anchorPos: number
  /** Monotonically increasing ID so stale responses can be discarded. */
  requestId: number
}

/** Meta payload dispatched to the plugin via `tr.setMeta()`. */
export type AiAutocompleteMeta =
  | { type: 'set-suggestion'; suggestion: string; anchorPos: number; requestId: number }
  | { type: 'accept-all' }
  | { type: 'accept-word'; acceptedLength: number; anchorPos: number }
  | { type: 'dismiss' }

/** Configuration options for the AI Autocomplete extension. */
export interface AiAutocompleteOptions {
  /** Debounce delay in ms before requesting a suggestion. @default 400 */
  debounceMs: number
  /** Max characters of context sent to the AI. @default 500 */
  maxContextLength: number
  /** Minimum characters of context required to trigger a request. @default 20 */
  minContextLength: number
}
