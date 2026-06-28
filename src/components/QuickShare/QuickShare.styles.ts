// Tailwind class strings for the QuickShare app. Uses theme tokens so it
// follows the active Genisys theme, matching the Genisys styles convention.

export const quickShareStyles = {
  root: 'flex h-full min-h-0 flex-col overflow-hidden bg-background text-foreground',
  header:
    'flex items-center gap-2 border-b border-border/70 bg-card/30 px-4 py-2.5',
  headerIcon: 'shrink-0 text-primary',
  headerTitle: 'text-sm font-semibold tracking-tight',
  headerSpacer: 'flex-1',
  headerMeta: 'flex items-center gap-1.5 text-xs text-muted-foreground',
  scroll: 'flex-1 overflow-y-auto',
  content: 'mx-auto flex w-full max-w-2xl flex-col gap-5 p-5',

  // ── two-pane body (running) ──────────────────────────────
  // A container-query context: panes sit side-by-side once there is room,
  // and stack into a single scrolling column when the app pane is narrow.
  body: '@container min-h-0 flex-1 overflow-y-auto @2xl:overflow-hidden',
  panes: 'flex min-h-0 flex-col @2xl:h-full @2xl:flex-row',
  leftPane:
    'flex flex-col gap-4 border-b border-border/70 p-4 @2xl:w-2/5 @2xl:shrink-0 @2xl:overflow-y-auto @2xl:border-b-0 @2xl:border-r',
  rightPane: 'flex min-h-0 flex-col @2xl:h-full @2xl:w-3/5 @2xl:flex-1',
  rightHeader:
    'flex items-center justify-between gap-2 border-b border-border/70 bg-card/20 px-4 py-3',
  rightHeaderTitle: 'flex items-center gap-2',
  rightActions: 'flex items-center gap-1.5',
  rightScroll: 'min-h-0 flex-1 @2xl:overflow-y-auto p-4',

  // ── share card ───────────────────────────────────────────
  card: 'flex flex-col gap-4 rounded-2xl border border-border/70 bg-gradient-to-b from-card/70 to-card/30 p-4 shadow-sm',
  qrWrap: 'flex flex-col items-center gap-3',
  qr: 'rounded-2xl bg-white p-3 shadow-lg ring-1 ring-black/5',
  qrCaption:
    'max-w-[38ch] text-center text-xs leading-relaxed text-muted-foreground',
  field: 'flex flex-col gap-1.5',
  fieldLabel:
    'text-[11px] font-medium uppercase tracking-wide text-muted-foreground',
  fieldRow:
    'flex min-w-0 items-center gap-2 rounded-lg border border-border/70 bg-muted/30 px-3 py-2 transition-colors focus-within:border-primary/60',
  fieldValue:
    'min-w-0 flex-1 select-all break-all font-mono text-[13px] leading-relaxed text-foreground',
  iconBtn:
    'inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground',
  folderRow:
    'flex min-w-0 items-center justify-between gap-3 rounded-lg border border-border/70 bg-muted/20 px-3 py-2.5',
  folderText: 'flex min-w-0 flex-col gap-0.5',
  folderLabel: 'text-[11px] uppercase tracking-wide text-muted-foreground',
  folderPath: 'truncate font-mono text-[12px] text-foreground',
  warning:
    'flex w-full min-w-0 items-start gap-2 rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2.5 text-xs leading-relaxed text-amber-600 dark:text-amber-300',
  clientsRow:
    'flex items-center gap-2 self-start rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400',
  clientsRowIdle:
    'flex items-center gap-2 self-start rounded-full border border-border/70 bg-muted/40 px-3 py-1.5 text-xs font-medium text-muted-foreground',
  liveDotWrap: 'relative flex h-2 w-2 items-center justify-center',
  liveDot: 'h-2 w-2 rounded-full bg-emerald-500',
  liveDotPing:
    'absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75',

  // ── composer ─────────────────────────────────────────────
  composer:
    'flex flex-col gap-3 rounded-2xl border border-border/70 bg-gradient-to-b from-card/70 to-card/30 p-4 shadow-sm',
  composerLabel:
    "flex items-center gap-3 text-[11px] uppercase tracking-wide text-muted-foreground before:h-px before:flex-1 before:bg-border/70 before:content-[''] after:h-px after:flex-1 after:bg-border/70 after:content-['']",
  recipientRow: 'flex items-center gap-2',
  recipientLabel:
    'shrink-0 text-[11px] uppercase tracking-wide text-muted-foreground',
  recipientTrigger:
    'flex w-full min-w-0 cursor-pointer items-center justify-between gap-2 rounded-lg border border-border/70 bg-muted/30 px-3 py-2 text-sm text-foreground outline-none transition-colors hover:border-primary/50 focus:border-primary',
  textarea:
    'min-h-[44px] w-full resize-y rounded-lg border border-border/70 bg-muted/30 px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground hover:border-border focus:border-primary',

  // ── tray ─────────────────────────────────────────────────
  trayHeader: 'mb-2 flex items-center justify-between',
  trayTitle: 'text-sm font-semibold tracking-tight text-foreground',
  trayCount:
    'rounded-full bg-muted/60 px-2 py-0.5 text-[11px] font-medium text-muted-foreground',
  tray: 'flex flex-col gap-2',
  empty:
    'flex flex-col items-center gap-1 rounded-2xl border border-dashed border-border/70 bg-muted/10 px-4 py-12 text-center text-sm text-muted-foreground',
  item: 'group flex items-start gap-3 rounded-xl border border-border/70 bg-card/40 p-3 transition-all hover:border-border hover:bg-card/70 hover:shadow-sm',
  thumb:
    'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-gradient-to-br from-primary/15 to-primary/5 text-primary',
  itemBody: 'flex min-w-0 flex-1 flex-col gap-1',
  itemName: 'break-words text-sm font-medium text-foreground',
  itemText:
    'max-h-40 overflow-auto whitespace-pre-wrap break-words rounded-lg border border-border/70 bg-muted/20 px-2.5 py-2 text-[13px] text-foreground',
  itemMeta: 'text-[11.5px] text-muted-foreground',
  itemActions: 'mt-0.5 flex flex-wrap items-center gap-1.5',

  // ── start cta ────────────────────────────────────────────
  startCta:
    'mx-auto mt-6 flex max-w-md flex-col items-center gap-4 px-4 py-10 text-center',
  startGlyph:
    'flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/15 to-primary/5 text-primary shadow-sm',
  startTitle: 'text-lg font-semibold tracking-tight',
  startIntro: 'text-sm leading-relaxed text-muted-foreground',
  error: 'text-xs text-destructive',
} as const
