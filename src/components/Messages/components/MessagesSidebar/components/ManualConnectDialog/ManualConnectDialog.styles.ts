export const manualConnectDialogStyles = {
  trigger:
    'flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-border/60 px-3 py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:border-border hover:text-foreground hover:bg-muted/40 cursor-pointer',
  triggerIcon: 'h-3.5 w-3.5',
  overlay: 'fixed inset-0 z-50 bg-black/40 backdrop-blur-sm',
  content:
    'fixed left-1/2 top-1/2 z-50 w-[min(440px,92vw)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border/40 bg-card p-6 shadow-lg',
  header: 'flex items-start gap-3',
  headerIconWrap:
    'flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary',
  title: 'text-base font-medium text-foreground',
  description: 'mt-0.5 text-[13px] leading-relaxed text-muted-foreground',
  closeButton:
    'ml-auto -mr-1 -mt-1 flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground cursor-pointer',
  form: 'mt-5 flex flex-col gap-3',
  fieldRow: 'flex gap-3',
  field: 'flex flex-col gap-1.5',
  fieldHost: 'flex-1',
  fieldPort: 'w-28',
  label: 'text-[11px] font-medium uppercase tracking-wide text-muted-foreground/60',
  input:
    'w-full rounded-lg border border-border/50 bg-muted/40 px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary/50',
  error: 'flex items-center gap-1.5 text-[12px] text-destructive',
  footer: 'mt-5 flex items-center justify-end gap-2',
  cancel:
    'rounded-md px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground cursor-pointer',
  connect:
    'flex items-center gap-2 rounded-md bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/15 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer',
  hint: 'mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground/70',
} as const
