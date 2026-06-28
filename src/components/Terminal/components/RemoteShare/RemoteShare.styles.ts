// Tailwind class strings for the Remote Share UI. Uses theme tokens so it
// follows the active Genisys theme, matching the Terminal styles convention.

export const remoteShareStyles = {
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
  perms: 'flex flex-col gap-2',
  permsHeader: 'text-[11px] uppercase tracking-wide text-muted-foreground',
  permRow:
    'flex items-center justify-between gap-3 rounded-md border border-border bg-muted/30 px-3 py-2',
  permText: 'flex min-w-0 flex-col',
  permLabel: 'text-[13px] font-medium text-foreground',
  permSub: 'text-xs text-muted-foreground',
  startCta: 'flex w-full min-w-0 flex-col gap-3',
  footer: 'flex items-center justify-between gap-2 pt-1',
  liveBadge: 'inline-flex items-center gap-1.5 text-xs font-medium text-emerald-500',
  liveDot: 'h-2 w-2 rounded-full bg-emerald-500',
  error: 'text-xs text-destructive',
  startButton: 'inline-flex items-center justify-center gap-2',
}
