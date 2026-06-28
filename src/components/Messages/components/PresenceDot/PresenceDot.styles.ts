import type { PresenceStatus } from './PresenceDot.types'

export const presenceDotStyles = {
  root: 'relative inline-flex shrink-0 items-center justify-center rounded-full bg-card',
  dot: 'h-full w-full rounded-full ring-2 ring-card',
  ping: 'absolute inset-0 rounded-full opacity-60 animate-ping',
} as const

export const PRESENCE_COLORS: Record<PresenceStatus, string> = {
  connected: 'bg-emerald-500',
  connecting: 'bg-amber-400',
  pending: 'bg-amber-400',
  discovered: 'bg-sky-400',
  disconnected: 'bg-muted-foreground/40',
  offline: 'bg-muted-foreground/40',
}
