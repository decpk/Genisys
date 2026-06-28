import { chatSurfaceRegistry } from './chatSurfaceRegistry'
import type { ChatSurfaceId } from './chatSurfaceRegistry.types'

/** Removes a chat-surface entry from the registry. No-op if id is unknown. */
export function unregisterChatSurface(id: ChatSurfaceId): void {
  chatSurfaceRegistry.delete(id)
}
