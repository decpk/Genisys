export const notificationToastBodyStyles = {
  wrap: 'min-w-0 flex-1',
  identityRow: 'flex items-baseline justify-between gap-2',
  appName: 'truncate leading-tight tracking-[-0.01em]',
  appNameWithTitle: 'text-[10px] font-medium text-muted-foreground',
  appNameNoTitle: 'text-[13px] font-semibold text-foreground',
  now: 'pointer-events-none shrink-0 text-[11px] leading-tight text-muted-foreground/70 transition-opacity duration-150 group-hover:opacity-0',
  title: 'mt-0.5 truncate text-[13px] font-semibold leading-tight tracking-[-0.01em] text-foreground',
  message: 'mt-0.5 text-[11px] leading-snug text-muted-foreground line-clamp-3',
} as const
