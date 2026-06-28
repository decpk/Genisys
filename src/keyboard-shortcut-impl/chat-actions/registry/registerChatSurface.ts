import { chatSurfaceRegistry } from './chatSurfaceRegistry'
import type { ChatSurfaceEntry } from './chatSurfaceRegistry.types'

/** Adds (or replaces) a chat-surface entry in the registry. */
export function registerChatSurface(entry: ChatSurfaceEntry): void {
  chatSurfaceRegistry.set(entry.id, entry)
}
