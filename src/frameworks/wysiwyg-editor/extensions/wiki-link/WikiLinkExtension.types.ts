/**
 * Public contract for the generic WikiLink editor extension. The wysiwyg-editor
 * framework stays decoupled from any specific app: the consumer (e.g. the Notes
 * app) supplies these callbacks via `.configure(...)` to wire search,
 * navigation, title resolution and note creation.
 */
export interface WikiLinkSuggestion {
  /** Stable identifier of the target document/note. */
  id: string
  /** Human-readable title used for display + matching. */
  title: string
}

export interface WikiLinkConfig {
  /** Return existing documents whose title matches the query (sync, store-backed). */
  search: (query: string) => WikiLinkSuggestion[]
  /** Resolve a title to a target id, or `null` when no document matches. */
  resolveByTitle: (title: string) => string | null
  /** Open/navigate to the target document by id. */
  navigate: (id: string) => void
  /** Create a new document with the given title; resolves to its new id. */
  createNote: (title: string) => Promise<string>
}

/** Tiptap node options === the consumer-provided config. */
export type WikiLinkOptions = WikiLinkConfig

/** A single row rendered in the `[[` autocomplete popup. */
export interface WikiLinkMenuItem {
  id: string
  title: string
  /** When true this row creates a brand new document titled `title`. */
  isCreate: boolean
}
