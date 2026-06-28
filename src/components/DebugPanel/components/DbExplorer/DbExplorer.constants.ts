import type { SavedQuery } from './DbExplorer.types'

export const SAVED_QUERIES: SavedQuery[] = [
  // ── Schema ──
  {
    id: 'schema-tables',
    label: 'List all tables',
    description: 'Show all tables in the database',
    query: "SELECT name, type FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name;",
    isWrite: false,
    category: 'schema',
  },
  {
    id: 'schema-indexes',
    label: 'List all indexes',
    description: 'Show all indexes in the database',
    query: "SELECT name, tbl_name, sql FROM sqlite_master WHERE type='index' AND name NOT LIKE 'sqlite_%' ORDER BY tbl_name, name;",
    isWrite: false,
    category: 'schema',
  },

  // ── Read: Explorer ──
  {
    id: 'read-explorer-history',
    label: 'Explorer history',
    description: 'Repository explorer history',
    query: 'SELECT * FROM explorer_history ORDER BY last_opened_at DESC LIMIT 50;',
    isWrite: false,
    category: 'read',
  },

  // ── Read: Chat ──
  {
    id: 'read-conversations',
    label: 'Conversations',
    description: 'All chat conversations',
    query: 'SELECT * FROM conversations ORDER BY updated_at DESC LIMIT 50;',
    isWrite: false,
    category: 'read',
  },
  {
    id: 'read-chat-messages',
    label: 'Recent messages',
    description: 'Latest chat messages across all conversations',
    query: 'SELECT cm.id, cm.conversation_id, cm.role, SUBSTR(cm.content, 1, 100) as content_preview, cm.timestamp, cm.sort_order FROM chat_messages cm ORDER BY cm.timestamp DESC LIMIT 50;',
    isWrite: false,
    category: 'read',
  },

  // ── Read: Prompts & Snippets ──
  {
    id: 'read-prompts',
    label: 'Prompts',
    description: 'All saved prompts',
    query: 'SELECT id, title, description, SUBSTR(content, 1, 80) as content_preview, tags, is_favorite, usage_count, updated_at FROM prompts ORDER BY updated_at DESC;',
    isWrite: false,
    category: 'read',
  },
  {
    id: 'read-snippets',
    label: 'Snippets',
    description: 'All saved snippets',
    query: 'SELECT id, title, SUBSTR(content, 1, 80) as content_preview, conversation_id, is_favorite, updated_at FROM snippets ORDER BY updated_at DESC;',
    isWrite: false,
    category: 'read',
  },

  // ── Row counts ──
  {
    id: 'read-row-counts',
    label: 'Table row counts',
    description: 'Count rows in all tables',
    query: `SELECT 'explorer_history' as tbl, COUNT(*) as cnt FROM explorer_history
UNION ALL SELECT 'conversations', COUNT(*) FROM conversations
UNION ALL SELECT 'chat_messages', COUNT(*) FROM chat_messages
UNION ALL SELECT 'prompts', COUNT(*) FROM prompts
UNION ALL SELECT 'snippets', COUNT(*) FROM snippets;`,
    isWrite: false,
    category: 'read',
  },

  // ── Delete ──
  {
    id: 'delete-explorer-history',
    label: 'Clear explorer history',
    description: 'Delete all explorer history entries',
    query: 'DELETE FROM explorer_history;',
    isWrite: true,
    category: 'delete',
  },
  {
    id: 'delete-chat-history',
    label: 'Clear all chats',
    description: 'Delete all conversations and messages',
    query: 'DELETE FROM conversations;',
    isWrite: true,
    category: 'delete',
  },
]

export const CATEGORY_LABELS: Record<string, string> = {
  schema: 'Schema',
  read: 'Read',
  write: 'Write',
  delete: 'Delete',
}

export const CATEGORY_COLORS: Record<string, string> = {
  schema: 'text-blue-400',
  read: 'text-green-400',
  write: 'text-yellow-400',
  delete: 'text-red-400',
}
