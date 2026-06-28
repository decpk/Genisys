import type { ChatSurfaceId } from './chatSurfaceRegistry.types'

let counter = 0

/**
 * Produces a unique, stable id for a chat-surface registration.
 * Ids are not exposed to users — they only key the registry Map.
 */
export function createChatSurfaceId(): ChatSurfaceId {
  counter += 1
  return `chat-surface-${counter}`
}
