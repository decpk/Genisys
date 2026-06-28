import type { ChatSource, ToolCallRecord } from '@/store/chat-history-store'
import type { CachedMessages, CachedSources, CachedToolCalls } from './chat-cache.types'
import { CHAT_CACHE_MAX_SIZE } from './chat-cache.types'

const MESSAGES_PAGE_SIZE = 50

/** Load the first page of messages for a conversation from the database. */
export async function loadMessagesFromDB(conversationId: string): Promise<CachedMessages> {
  const page = await window.api.loadConversationMessages(conversationId, null, MESSAGES_PAGE_SIZE)
  return {
    messages: page.messages,
    hasMore: page.hasMore,
  }
}

/** Load all sources attached to a conversation from the database. */
export async function loadSourcesFromDB(conversationId: string): Promise<CachedSources> {
  const sources = await window.api.loadResearchSources(conversationId)
  return sources as ChatSource[]
}

/** Load all tool call records for a conversation from the database. */
export async function loadToolCallsFromDB(conversationId: string): Promise<CachedToolCalls> {
  const toolCalls = await window.api.loadToolCalls(conversationId)
  return toolCalls as ToolCallRecord[]
}

export { CHAT_CACHE_MAX_SIZE }
