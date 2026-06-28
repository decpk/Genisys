// Tailwind class strings for the Monitor app + Share UI. Uses theme tokens so
// it follows the active Genisys theme, matching the Genisys styles convention.

export const monitorStyles = {
  // ── app shell ────────────────────────────────────────────
  root: 'flex h-full w-full min-h-0 flex-col bg-background',
  header:
    'flex shrink-0 items-center justify-between gap-3 border-b border-border px-4 py-3',
  titleWrap: 'flex min-w-0 items-center gap-3',
  titleIcon:
    'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-500/15 text-rose-500',
  title: 'text-sm font-semibold text-foreground',
  subtitle: 'truncate text-xs text-muted-foreground',
  headerActions: 'flex shrink-0 items-center gap-2',

  // ── live stage ───────────────────────────────────────────
  stage:
    'relative flex flex-1 min-h-0 items-center justify-center overflow-hidden bg-black',
  video: 'h-full w-full object-contain',
  // Mirror the local preview so it reads like a selfie view (remote sees raw).
  videoMirror: '-scale-x-100',
  liveTag:
    'absolute left-3 top-3 z-10 inline-flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 text-xs font-medium text-white backdrop-blur',
  liveDot: 'h-2 w-2 rounded-full bg-rose-500 animate-pulse',

  // ── idle (stopped) state ─────────────────────────────────
  idle: 'flex max-w-md flex-col items-center gap-4 px-6 py-10 text-center',
  idleIcon:
    'flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500',
  idleTitle: 'text-base font-semibold text-foreground',
  idleText: 'text-sm leading-relaxed text-muted-foreground',
  notes: 'mt-1 flex w-full flex-col gap-2 text-left',
  note: 'flex items-start gap-2 text-xs leading-relaxed text-muted-foreground',
  noteIcon: 'mt-px h-3.5 w-3.5 shrink-0 text-rose-500/80',
  error: 'text-sm text-destructive',
  startButton: 'mt-1 inline-flex items-center justify-center gap-2',

  // ── badges / buttons ─────────────────────────────────────
  liveBadge:
    'inline-flex items-center gap-1.5 text-xs font-medium text-rose-500',
  shareBtn: 'inline-flex items-center justify-center gap-1.5',

  // ── share panel (mirrors RemoteShare) ────────────────────
  body: 'flex w-full min-w-0 flex-col gap-4',
  intro: 'text-sm text-muted-foreground leading-relaxed',
  warning:
    'flex w-full min-w-0 items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs leading-relaxed text-amber-600 dark:text-amber-300',
  qrWrap: 'flex flex-col items-center gap-3 py-1',
  qr: 'rounded-lg bg-white p-3 shadow-sm',
  qrCaption: 'max-w-[34ch] text-center text-xs text-muted-foreground',
  field: 'flex flex-col gap-1.5',
  fieldLabel: 'text-[11px] uppercase tracking-wide text-muted-foreground',
  fieldRow:
    'flex min-w-0 items-start gap-2 rounded-md border border-border bg-muted/40 px-3 py-2',
  fieldValue:
    'min-w-0 flex-1 select-all break-all font-mono text-[13px] leading-relaxed text-foreground',
  iconBtn:
    'inline-flex h-6 w-6 shrink-0 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground',
  clientsHeader:
    'mb-1.5 flex items-center justify-between text-[11px] uppercase tracking-wide text-muted-foreground',
  clientList: 'flex flex-col gap-1.5',
  clientRow:
    'flex min-w-0 items-center gap-2 rounded-md border border-border bg-muted/30 px-2.5 py-1.5 text-xs',
  clientMeta: 'min-w-0 flex-1',
  clientIp: 'font-medium text-foreground',
  clientSub: 'truncate text-muted-foreground',
  disconnectBtn:
    'shrink-0 rounded px-2 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive',
  clientsEmpty:
    'rounded-md border border-dashed border-border px-3 py-4 text-center text-xs text-muted-foreground',
  startCta: 'flex w-full min-w-0 flex-col gap-3',
  footer: 'flex items-center justify-between gap-2 pt-1',
  panelLiveBadge:
    'inline-flex items-center gap-1.5 text-xs font-medium text-rose-500',
  panelLiveDot: 'h-2 w-2 rounded-full bg-rose-500',
}
