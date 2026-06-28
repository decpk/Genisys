// Tailwind class strings for the terminal git diff overlay. Token-based so it
// follows the active Genisys theme in both light and dark modes.

export const terminalDiffOverlayStyles = {
  // Dim, blurred scrim that fills the pane's terminal surface area.
  scrim:
    'absolute inset-0 z-20 flex bg-background/55 backdrop-blur-sm ' +
    'animate-in fade-in-0 duration-150',
  // Floating, rounded diff card that lifts off the scrim.
  card:
    'relative m-2 flex flex-col flex-1 min-w-0 min-h-0 rounded-xl overflow-hidden ' +
    'bg-background ring-1 ring-border/60 shadow-2xl ' +
    'animate-in fade-in-0 zoom-in-95 duration-150',
  header:
    'flex items-center gap-2 h-11 px-3 shrink-0 border-b border-border/50 ' +
    'bg-gradient-to-b from-foreground/[0.04] to-transparent',
  headerIcon: 'shrink-0',
  headerPath: 'text-[12px] font-mono text-foreground/90 truncate min-w-0',
  headerActions: 'ml-auto flex items-center gap-2 shrink-0',
  closeBtn:
    'flex items-center justify-center h-7 w-7 rounded-md text-muted-foreground ' +
    'hover:text-foreground hover:bg-foreground/10 transition-colors',
  editorWrap: 'flex-1 min-h-0',
  stateWrap: 'flex-1 min-h-0 flex items-center justify-center p-6',
} as const
