import type { ComponentType } from 'react'

export interface NoteScopeOption {
  type: string
  id: string
  label: string
  icon?: ComponentType<{ size?: number; className?: string }>
}

export interface NoteAutocompleteSuggestion {
  id: string
  label: string
  description?: string
  insertText: string
  category?: string
}

export interface NotesPanelData {
  appId: string
  scopes: NoteScopeOption[]
  defaultScopeType?: string
  suggestions?: NoteAutocompleteSuggestion[]
}

export interface NotesPanelActions {
  [key: string]: (...args: never[]) => void
  onScopeChange: (scope: NoteScopeOption) => void
}
