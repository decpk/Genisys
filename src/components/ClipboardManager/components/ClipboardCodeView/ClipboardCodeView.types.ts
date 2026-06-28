export type ClipboardCodeViewMode = 'card' | 'modal'

export interface ClipboardCodeViewProps {
  /** The raw text content to render. */
  code: string
  /** A Shiki language id (e.g. 'typescript', 'json'). Caller picks via `guessLanguage`. */
  lang: string
  /** Display mode — controls clamping, padding and font size. */
  mode: ClipboardCodeViewMode
}
