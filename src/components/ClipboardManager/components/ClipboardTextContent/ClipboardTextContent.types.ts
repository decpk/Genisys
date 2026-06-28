export type ClipboardTextContentMode = 'card' | 'modal'

export interface ClipboardTextContentProps {
  /**
   * Original (unmasked) text — used for code detection and language guessing.
   * Never rendered directly when masking is in effect.
   */
  text: string
  /**
   * The text to actually render. When `displayText !== text`, masking is in
   * effect and highlighting is automatically disabled.
   */
  displayText: string
  /** Layout mode: `'card'` for the virtualized list, `'modal'` for the full preview. */
  mode: ClipboardTextContentMode
}
