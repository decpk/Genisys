// Tailwind class strings — use theme tokens so the terminal follows the
// active app theme (background, foreground, border, primary, sidebar, etc.).

export const terminalStyles = {
  root: "relative flex flex-col w-full shrink-0 bg-background border-t border-border text-foreground select-none",
  rootHidden: "hidden",
  dockHandle:
    "absolute top-0 left-0 right-0 h-[1px] cursor-row-resize z-20 hover:bg-primary/60 active:bg-primary/80 transition-colors",
  header:
    "flex items-stretch justify-between gap-2 h-8 pr-2 border-b border-border bg-sidebar shrink-0",
  tabBar: "flex items-stretch gap-px overflow-x-auto min-w-0 scrollbar-none",
  tab: "group relative flex items-center gap-2 h-full pl-3 pr-2 text-[12px] font-medium text-muted-foreground hover:text-foreground hover:bg-foreground/[0.04] transition-colors cursor-pointer whitespace-nowrap min-w-[140px] max-w-[220px] border-r border-border/50",
  tabActive:
    "text-foreground bg-background before:absolute before:top-0 before:left-0 before:right-0 before:h-[2px] before:bg-primary before:rounded-b-sm",
  tabExited: "opacity-60 italic",
  tabIcon: "w-3 h-3 shrink-0 text-emerald-500/80",
  tabIconExited: "w-3 h-3 shrink-0 text-rose-500/70",
  tabTitle: "truncate flex-1 min-w-0 text-left",
  tabBadge:
    "shrink-0 text-[10px] font-mono tabular-nums px-1 py-px rounded bg-foreground/5 text-muted-foreground",
  tabClose:
    "shrink-0 inline-flex items-center justify-center w-4 h-4 rounded text-muted-foreground hover:text-foreground hover:bg-foreground/15 transition-opacity duration-100 opacity-0 group-hover:opacity-100 focus-visible:opacity-100",
  tabCloseActive: "opacity-100",
  tabPin:
    "shrink-0 inline-flex items-center justify-center w-4 h-4 rounded text-muted-foreground hover:text-foreground hover:bg-foreground/15 transition-opacity duration-100 opacity-0 group-hover:opacity-100 focus-visible:opacity-100",
  tabPinActive: "opacity-100 text-primary hover:text-primary",
  newTabBtn:
    "flex items-center justify-center h-full w-8 shrink-0 text-muted-foreground hover:text-foreground hover:bg-foreground/[0.05] transition-colors",
  toolbar: "flex items-center gap-0.5 shrink-0 self-center",
  toolbarBtn:
    "flex items-center justify-center h-6 w-6 rounded-md text-muted-foreground hover:text-foreground hover:bg-foreground/10 transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-muted-foreground",
  body: "flex-1 min-h-0 relative bg-background",
  surface: "absolute inset-0 p-2",
  surfaceHidden: "invisible pointer-events-none",
  empty:
    "absolute inset-0 flex flex-col items-center justify-center gap-3 text-muted-foreground text-sm",
  emptyButton:
    "inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-xs font-medium bg-foreground/[0.08] hover:bg-foreground/15 text-foreground border border-border transition-colors",
};
