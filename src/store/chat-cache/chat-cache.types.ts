import type { ChatMessage } from '../../../../preload/index.d'
import type { ChatSource, ToolCallRecord } from '@/store/chat-history-store'

/** Cached payload for a conversation's messages (includes pagination state). */
export interface CachedMessages {
  messages: ChatMessage[]
  hasMore: boolean
}

/** Cached payload for a conversation's sources. */
export type CachedSources = ChatSource[]

/** Cached payload for a conversation's tool call records. */
export type CachedToolCalls = ToolCallRecord[]

/** Maximum number of conversations kept in the LRU cache. */
export const CHAT_CACHE_MAX_SIZE = 10
