// Tailwind class strings for the terminal git changes panel. Token-based so it
// follows the active Genisys theme in both light and dark modes.

export const terminalGitPanelStyles = {
  // Floating glass panel docked to the right edge of a terminal pane.
  panel:
    'relative flex flex-col h-full min-h-0 shrink-0 bg-card/95 border-l border-border/60 ' +
    'animate-in fade-in-0 slide-in-from-right-2 duration-200',

  // Left-edge drag handle (1px line that lights up on hover/drag).
  resizeHandle:
    'group absolute inset-y-0 -left-1 w-2 z-20 cursor-col-resize select-none',
  resizeHandleLine:
    'absolute inset-y-0 left-1 w-px bg-transparent group-hover:bg-primary/70 ' +
    'group-active:bg-primary transition-colors',

  // Header.
  header:
    'flex items-center gap-2 h-10 px-3 shrink-0 border-b border-border/50 ' +
    'bg-gradient-to-b from-foreground/[0.03] to-transparent',
  headerIcon: 'shrink-0 text-primary',
  headerTitle: 'text-[12px] font-semibold text-foreground truncate',
  countPill:
    'shrink-0 rounded-full bg-foreground/[0.08] text-muted-foreground text-[10px] ' +
    'tabular-nums px-1.5 py-0.5 leading-none',
  headerActions: 'ml-auto flex items-center gap-0.5 shrink-0',
  iconBtn:
    'flex items-center justify-center h-6 w-6 rounded-md text-muted-foreground ' +
    'hover:text-foreground hover:bg-foreground/10 transition-colors ' +
    'disabled:opacity-40 disabled:pointer-events-none',
  spin: 'animate-spin',

  // Body + sections.
  body: 'flex-1 min-h-0 overflow-y-auto overscroll-contain',
  sectionWrap: 'py-1',

  // File row.
  row:
    'group/row flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-left ' +
    'cursor-pointer hover:bg-foreground/[0.06] active:scale-[0.99] ' +
    'transition-[background-color,transform] text-xs min-w-0',
  rowIcon: 'shrink-0',
  rowText: 'flex flex-col min-w-0 flex-1',
  rowName: 'truncate text-foreground leading-tight',
  rowDir: 'truncate text-muted-foreground/60 text-[10px] leading-tight',
  rowChevron:
    'shrink-0 text-transparent group-hover/row:text-muted-foreground/70 transition-colors',
  badge:
    'shrink-0 inline-flex items-center justify-center w-4 h-4 rounded text-[9px] ' +
    'font-semibold border',

  // Empty / status states.
  empty: 'flex flex-col items-center justify-center gap-2 px-5 py-10 text-center h-full',
  emptyIcon: 'text-muted-foreground/40',
  emptyText: 'text-[11px] text-muted-foreground/80 leading-snug max-w-[200px]',
} as const
