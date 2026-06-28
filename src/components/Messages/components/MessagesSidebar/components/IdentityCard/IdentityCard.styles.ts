export const identityCardStyles = {
  root: "flex flex-col gap-2.5 rounded-xl bg-muted/40 p-3",
  topRow: "flex items-center gap-3 pr-2.5",
  avatarWrap: "relative shrink-0",
  presence: "absolute -bottom-0.5 -right-0.5",
  body: "min-w-0 flex-1",
  nameRow: "flex items-center gap-1.5",
  name: "truncate text-sm font-medium text-foreground",
  editButton:
    "ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground cursor-pointer",
  nameInput:
    "w-full rounded-md border border-border/50 bg-background px-2 py-1 text-sm font-medium text-foreground outline-none focus:border-primary/50",
  metaRow: "mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground/70",
  fingerprint: "truncate font-mono tracking-tight",
  revealToggle:
    "flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground cursor-pointer",
  youBadge:
    "rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary",
  addressRow:
    "flex items-center gap-2 rounded-lg bg-background/40 px-2.5 py-1.5",
  addressInfo: "min-w-0 flex-1",
  addressLabel:
    "text-[11px] font-medium uppercase tracking-wide text-muted-foreground/60",
  address: "truncate font-mono text-xs font-medium text-foreground",
  addressEmpty: "truncate text-xs italic text-muted-foreground/70",
  addressNote: "mt-0.5 truncate text-[10px] text-muted-foreground/60",
  iconButton:
    "flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground cursor-pointer disabled:cursor-not-allowed disabled:opacity-40",
  offlineRow:
    "flex items-center gap-2 rounded-lg bg-background/40 px-2.5 py-1.5",
  offlineInfo: "min-w-0 flex-1",
  offlineLabel: "text-xs font-medium text-foreground",
  offlineHint: "truncate text-[11px] text-muted-foreground/70",
} as const;
