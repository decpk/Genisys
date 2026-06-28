import type { NotificationType } from '@/frameworks/notification'
import { CheckCircle2, XCircle, AlertTriangle, Info } from 'lucide-react'

// ── Type‑specific visual config ──────────────────────────────────────

export const TYPE_CONFIG: Record<
  NotificationType,
  {
    color: string
    bg: string
    accent: string
    Icon: React.ComponentType<{ size?: number; className?: string }>
  }
> = {
  success: { color: 'text-success', bg: 'bg-success/10', accent: 'border-l-success', Icon: CheckCircle2 },
  error: { color: 'text-destructive', bg: 'bg-destructive/10', accent: 'border-l-destructive', Icon: XCircle },
  warning: { color: 'text-warning', bg: 'bg-warning/10', accent: 'border-l-warning', Icon: AlertTriangle },
  info: { color: 'text-info', bg: 'bg-info/10', accent: 'border-l-info', Icon: Info },
}

// ── Shared class‑name constants ──────────────────────────────────────

export const styles = {
  /** Outer row wrapper (base — merged with read/unread & accent via cn()) */
  row: 'group relative flex gap-3 px-4 py-2.5 rounded-lg border border-l-2 transition-all duration-150',
  rowUnread: 'border-border bg-card hover:bg-secondary/30',
  rowRead: 'border-border/40 bg-card/50 hover:bg-secondary/20',

  /** Unread indicator dot */
  unreadDot: 'absolute top-3.5 left-1 w-1.5 h-1.5 rounded-full bg-info',

  /** Status icon container */
  iconBox: 'shrink-0 self-start p-1.5 rounded-lg',

  /** Header row (type · source + time/actions) */
  headerRow: 'flex items-center gap-2 mb-0.5',
  typeBadge: 'text-[10px] font-semibold uppercase tracking-wider',
  dot: 'text-[10px] text-muted-foreground/50',
  source: 'text-[11px] text-muted-foreground font-medium truncate',

  /** Timestamp & action buttons share the same slot */
  slotWrapper: 'ml-auto flex items-center gap-1 shrink-0',
  timestamp: 'text-[10px] text-muted-foreground/50 tabular-nums transition-opacity duration-150 group-hover:opacity-0',
  actionsWrapper: 'absolute right-3 top-3 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150',

  /** Action button */
  actionBtn: 'p-1 rounded-md transition-colors cursor-pointer',
  actionBtnDefault: 'text-muted-foreground/70 hover:text-foreground hover:bg-secondary',
  actionBtnDanger: 'text-muted-foreground/70 hover:text-destructive hover:bg-destructive/10',

  /** Title */
  titleUnread: 'text-[13px] font-semibold text-foreground mb-0.5',
  titleRead: 'text-[13px] font-medium text-muted-foreground mb-0.5',

  /** Description / message */
  messageUnread: 'text-xs leading-relaxed text-muted-foreground line-clamp-2',
  messageRead: 'text-xs leading-relaxed text-muted-foreground/60 line-clamp-2',
} as const
