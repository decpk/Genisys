import type { ComponentType } from 'react'

export interface AIEditorHandle {
  focus: () => void
  clear: () => void
  getText: () => string
  insertText: (text: string) => void
  /** Inserts text at the current cursor position without forcing focus to end first. */
  insertContent: (text: string) => void
  getMentions: () => string[]
  isEmpty: () => boolean
}

export interface AIMentionItem {
  id: string
  label: string
  description?: string
  icon?: ComponentType<{ size?: number; className?: string }>
  isGroup?: boolean
}

export interface AIMentionConfig {
  /** Trigger character. @default '@' */
  char?: string
  /** Label shown above the suggestion list. */
  menuLabel?: string
  /** Callback to fetch/filter mention items for a given query. */
  fetchItems: (query: string) => Promise<AIMentionItem[]>
}

export interface AIEditorProps {
  onSubmit: (intent: 'send' | 'queue') => void
  isDisabled: boolean
  placeholder?: string
  mentionConfig?: AIMentionConfig
}
