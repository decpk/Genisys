import type { RefObject } from 'react'

/** Stable identifier produced by `createChatSurfaceId()`. */
export type ChatSurfaceId = string

/**
 * A handler invoked when the Cmd/Ctrl+N shortcut fires and this surface
 * contains `document.activeElement`. Equivalent to clicking the surface's
 * own "+ New Chat" button.
 */
export type ChatNewChatHandler = () => void

/** An entry registered by one chat surface (Main Chat, AI Assistant panel, Explorer AI panel, etc.). */
export interface ChatSurfaceEntry {
  id: ChatSurfaceId
  /** Ref to the surface's root DOM element. Used to test `containerRef.current?.contains(activeElement)`. */
  containerRef: RefObject<HTMLElement | null>
  /** Latest "new chat" handler for this surface. Always reflects the current render's closure. */
  handlerRef: RefObject<ChatNewChatHandler | null>
}
