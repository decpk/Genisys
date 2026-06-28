/**
 * Create a DOM element that renders ghost (autocomplete suggestion) text.
 * The element is an inline span that visually blends with the surrounding
 * text but is rendered in a muted, translucent style.
 */
export function createGhostTextElement(text: string): HTMLSpanElement {
  const span = document.createElement('span')
  span.className = 'ai-ghost-text'
  span.textContent = text
  // Prevent the ghost text from being selectable or interfering with cursor
  span.setAttribute('contenteditable', 'false')
  return span
}
