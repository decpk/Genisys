import { useEffect, useMemo, useRef, type RefObject } from 'react'

import { createChatSurfaceId } from '../registry/createChatSurfaceId'
import { registerChatSurface } from '../registry/registerChatSurface'
import { unregisterChatSurface } from '../registry/unregisterChatSurface'
import type {
  ChatNewChatHandler,
  ChatSurfaceId,
} from '../registry/chatSurfaceRegistry.types'

/**
 * Registers the calling component as a "chat surface" for the lifetime of its
 * mount. The shared Cmd/Ctrl+N shortcut will invoke `handler` when the user's
 * focus is inside `containerRef.current`.
 *
 * - `containerRef` must point at the surface's root DOM node (the element
 *   containing both the conversation list / messages AND the input).
 * - `handler` is mirrored through a ref so the registry always sees the
 *   latest closure without re-registering on every render.
 */
export function useRegisterChatSurface(
  containerRef: RefObject<HTMLElement | null>,
  handler: ChatNewChatHandler,
): void {
  const handlerRef = useRef<ChatNewChatHandler | null>(handler)

  // Keep the ref in sync with the latest handler each render.
  useEffect(() => {
    handlerRef.current = handler
  }, [handler])

  // Stable id per mount.
  const id = useMemo<ChatSurfaceId>(() => createChatSurfaceId(), [])

  useEffect(() => {
    registerChatSurface({ id, containerRef, handlerRef })
    return () => {
      unregisterChatSurface(id)
    }
    // containerRef identity is stable (created via useRef); we only register once per mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])
}
