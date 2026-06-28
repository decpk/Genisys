import type { PromptScopeApp } from './promptScope.types'

/**
 * AppViews that expose a prompt picker. A folder can be scoped to one or
 * more of these surfaces; if no scopes are set the folder shows up in all
 * of them. Order is the order shown in the folder scope editor.
 */
export const SCOPABLE_APPS: ReadonlyArray<{ id: PromptScopeApp; label: string }> = [
  { id: 'chat', label: 'Chat' },
  { id: 'explorer', label: 'Explorer' },
  { id: 'library', label: 'Library' },
  { id: 'notes', label: 'Notes' },
  { id: 'dailyplan', label: 'Daily Plan' },
  { id: 'apiclient', label: 'API Client' },
  { id: 'clipboard', label: 'Clipboard' },
  { id: 'terminal', label: 'Terminal' },
]
