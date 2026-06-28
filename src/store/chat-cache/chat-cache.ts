import { AsyncLRUCache } from '@/lib/async-lru-cache'

import type { CachedMessages, CachedSources, CachedToolCalls } from './chat-cache.types'
import { CHAT_CACHE_MAX_SIZE } from './chat-cache.types'
import { loadMessagesFromDB, loadSourcesFromDB, loadToolCallsFromDB } from './chat-cache.loaders'

/** LRU cache for conversation messages (keyed by conversationId). */
export const messagesCache = new AsyncLRUCache<string, CachedMessages>({
  maxSize: CHAT_CACHE_MAX_SIZE,
  loader: loadMessagesFromDB,
})

/** LRU cache for conversation sources (keyed by conversationId). */
export const sourcesCache = new AsyncLRUCache<string, CachedSources>({
  maxSize: CHAT_CACHE_MAX_SIZE,
  loader: loadSourcesFromDB,
})

/** LRU cache for conversation tool calls (keyed by conversationId). */
export const toolCallsCache = new AsyncLRUCache<string, CachedToolCalls>({
  maxSize: CHAT_CACHE_MAX_SIZE,
  loader: loadToolCallsFromDB,
})

/** Invalidate all caches for a given conversation. */
export function invalidateConversationCaches(conversationId: string): void {
  messagesCache.invalidate(conversationId)
  sourcesCache.invalidate(conversationId)
  toolCallsCache.invalidate(conversationId)
}

/** Clear all chat caches entirely. */
export function clearAllChatCaches(): void {
  messagesCache.clear()
  sourcesCache.clear()
  toolCallsCache.clear()
}
