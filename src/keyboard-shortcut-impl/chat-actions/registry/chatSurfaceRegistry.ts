import type { ChatSurfaceEntry, ChatSurfaceId } from './chatSurfaceRegistry.types'

/**
 * Module-level singleton storing all currently-mounted chat surfaces.
 *
 * Insertion order is preserved (latest-mounted surface is checked last);
 * the lookup in `getFocusedChatSurfaceHandler` only ever matches a single
 * entry because chat-surface containers do not nest in this codebase.
 *
 * This is intentionally a plain `Map` (not a Zustand store) — the registry
 * is read only from a keyboard event handler, never inside a React render.
 */
export const chatSurfaceRegistry = new Map<ChatSurfaceId, ChatSurfaceEntry>()
