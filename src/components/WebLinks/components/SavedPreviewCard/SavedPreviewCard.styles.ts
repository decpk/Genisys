/** Tailwind class-name constants for a `SavedPreviewCard`. */
export const STYLES = {
  card:
    'group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md',
  cardBusy: 'pointer-events-none opacity-60',
  hero: 'h-32 w-full object-cover',
  synthBanner: 'relative flex h-32 w-full items-center justify-center overflow-hidden',
  monogram: 'select-none text-4xl font-bold tracking-tight text-white/95 drop-shadow-sm',
  bannerFavicon: 'absolute size-12 rounded-xl bg-white/95 object-contain p-2 shadow-md',
  body: 'flex flex-1 flex-col gap-1.5 p-3',
  siteRow: 'flex items-center gap-1.5 text-xs text-muted-foreground',
  favicon: 'size-3.5 shrink-0 rounded-sm',
  siteName: 'truncate',
  title: 'line-clamp-2 text-sm font-semibold leading-snug text-foreground',
  url: 'truncate font-mono text-[11px] text-muted-foreground/80',
  footer: 'flex items-center gap-0.5 border-t border-border/60 px-2 py-1.5',
  spacer: 'flex-1',
} as const
