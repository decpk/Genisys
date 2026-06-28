import type { Editor } from '@tiptap/react'
import type { WikiLinkConfig } from './extensions/wiki-link'

export interface WysiwygEditorProps {
  value?: string
  onChange?: (markdown: string) => void
  readOnly?: boolean
  placeholder?: string
  className?: string
  style?: React.CSSProperties
  autoFocus?: boolean
  /** Enable VS Code-style AI inline autocomplete (ghost text). @default false */
  enableAIAutocomplete?: boolean
  /**
   * Enable Obsidian-style `[[Title]]` wiki links between documents. Provide the
   * search/navigate/resolve/create wiring; when omitted the feature is fully
   * off (backward-compatible — Chat/AI editors stay unaffected).
   * @default undefined
   */
  wikiLink?: WikiLinkConfig
  /**
   * Invoked whenever the underlying Tiptap editor instance becomes available
   * (mount) or is torn down (unmount, called with `null`). Use this to bridge
   * the editor into surrounding panels/contexts (e.g. TOC, outlines).
   * @default undefined — backward-compatible no-op.
   */
  onEditorReady?: (editor: Editor | null) => void
  /**
   * Fired when the user APPLIES the highlight mark to a non-empty selection via
   * the bubble menu. Provides the selected text and its ProseMirror char range.
   * @default undefined — no-op (backward compatible).
   */
  onHighlightApplied?: (text: string, from: number, to: number) => void
  /**
   * Fired when the user REMOVES the highlight mark over a selection via the
   * bubble menu. Provides the affected ProseMirror char range.
   * @default undefined — no-op.
   */
  onHighlightRemoved?: (from: number, to: number) => void
}
