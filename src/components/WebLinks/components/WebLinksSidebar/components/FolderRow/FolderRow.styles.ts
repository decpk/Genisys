/** Tailwind class-name constants for a sidebar `FolderRow`. */
export const STYLES = {
  row:
    'group flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-foreground/80 transition-colors hover:bg-secondary/60 hover:text-foreground',
  rowActive: 'bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary',
  icon: 'shrink-0 text-muted-foreground',
  colorDot: 'size-3 shrink-0 rounded-full ring-1 ring-black/5',
  label: 'flex-1 truncate',
  count:
    'shrink-0 text-xs tabular-nums text-muted-foreground/70 transition-transform duration-200 ease-out',
  /** Resting: count occupies the (hidden) menu-button slot, then slides back on row hover. */
  countResting: 'translate-x-[26px] group-hover:translate-x-0',
  /** Shifted: count stays in its natural position (used while the menu is open). */
  countShifted: 'translate-x-0',
  menuButton:
    'opacity-0 transition-opacity duration-200 group-hover:opacity-100 data-[state=open]:opacity-100',
} as const
