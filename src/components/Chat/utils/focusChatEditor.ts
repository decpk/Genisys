import type { Editor } from '@tiptap/react'

/**
 * Focuses the global Chat TipTap editor (if it is currently mounted).
 * The editor is exposed by `ChatEditor` as `window.__chatEditor`.
 *
 * Pure DOM/global access — kept out of React so it can be invoked from
 * any callback or `requestAnimationFrame`.
 */
export function focusChatEditor(): void {
  const editor = (window as unknown as Record<string, unknown>).__chatEditor as
    | Editor
    | undefined
  editor?.commands.focus()
}
