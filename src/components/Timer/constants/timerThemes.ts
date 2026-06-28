export interface TimerTheme {
  id: string
  label: string
  ringColor: string
  accentColor: string
}

export const TIMER_THEMES: TimerTheme[] = [
  { id: 'amber', label: 'Amber', ringColor: '#f59e0b', accentColor: '#fbbf24' },
  { id: 'sky', label: 'Sky', ringColor: '#0ea5e9', accentColor: '#38bdf8' },
  { id: 'emerald', label: 'Emerald', ringColor: '#10b981', accentColor: '#34d399' },
  { id: 'rose', label: 'Rose', ringColor: '#f43f5e', accentColor: '#fb7185' },
  { id: 'violet', label: 'Violet', ringColor: '#8b5cf6', accentColor: '#a78bfa' },
  { id: 'slate', label: 'Slate', ringColor: '#64748b', accentColor: '#94a3b8' },
]
