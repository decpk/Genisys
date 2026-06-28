import type { GitChangeCategory } from './GitPanel.types'

export const STATUS_LABELS: Record<string, GitChangeCategory> = {
  M: 'modified',
  A: 'added',
  D: 'deleted',
  R: 'renamed',
  '?': 'untracked'
} as const

export const CATEGORY_STYLES: Record<
  GitChangeCategory,
  { label: string; className: string; badgeClass: string }
> = {
  modified: {
    label: 'Modified',
    className: 'text-warning',
    badgeClass: 'bg-warning/15 text-warning border-warning/30'
  },
  added: {
    label: 'Added',
    className: 'text-success',
    badgeClass: 'bg-success/15 text-success border-success/30'
  },
  deleted: {
    label: 'Deleted',
    className: 'text-destructive',
    badgeClass: 'bg-destructive/15 text-destructive border-destructive/30'
  },
  renamed: {
    label: 'Renamed',
    className: 'text-info',
    badgeClass: 'bg-info/15 text-info border-info/30'
  },
  untracked: {
    label: 'Untracked',
    className: 'text-muted-foreground',
    badgeClass: 'bg-muted text-muted-foreground border-border'
  }
} as const

export const GIT_PANEL_MIN_WIDTH = 250
export const GIT_PANEL_MAX_WIDTH = 500
export const GIT_PANEL_DEFAULT_WIDTH = 300

export const COMMITS_PER_PAGE = 50
