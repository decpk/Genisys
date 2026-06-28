export interface ConversationMessagesPage {
  messages: Array<{
    id: string
    role: string
    content: string
    timestamp: string
    sortOrder: number
    reasoning?: string | null
    activitiesJson?: string | null
  }>
  hasMore: boolean
}

export async function fetchConversationMessages(
  conversationId: string,
  beforeSortOrder: number | null,
  limit: number,
): Promise<ConversationMessagesPage> {
  return (await window.api.loadConversationMessages(
    conversationId,
    beforeSortOrder,
    limit,
  )) as ConversationMessagesPage
}
