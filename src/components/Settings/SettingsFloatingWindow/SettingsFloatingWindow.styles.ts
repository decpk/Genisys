export const settingsFloatingWindowStyles = {
  // `left:0; top:0` keeps the element at the origin so the `transform`
  // applied via style takes full effect (browsers compute final pos as
  // `position offset + transform`). `contain: layout paint` isolates
  // repaints from the host app. `isolation: isolate` ensures the
  // shadow + transition can't leak into ancestor stacking contexts.
  root:
    'fixed left-0 top-0 z-50 flex flex-col bg-background rounded-xl border border-border/60 shadow-2xl shadow-black/40 overflow-hidden [contain:layout_paint] [isolation:isolate]',
  rootDragging: 'select-none cursor-grabbing',
  // `overscroll-contain` keeps wheel/touch scroll from bubbling to the
  // host app behind the window. Scroll inside Settings.tsx itself.
  body: 'flex-1 min-h-0 overflow-hidden bg-background overscroll-contain',
  fallback: 'flex items-center justify-center py-10',
  errorWrap: 'flex-1 min-h-0',
  header: {
    container:
      'flex items-center gap-2 h-10 px-3 border-b border-border/40 bg-card/40 shrink-0',
    dragRegion:
      'flex items-center gap-2 flex-1 min-w-0 cursor-grab touch-none select-none',
    dragRegionActive: 'cursor-grabbing',
    icon: 'size-4 text-muted-foreground shrink-0',
    title: 'text-[13px] font-medium text-foreground shrink-0',
    subtitle:
      'text-[11px] uppercase tracking-wider text-muted-foreground/60 truncate',
    actions: 'flex items-center gap-0.5 shrink-0',
    iconButton:
      'inline-flex items-center justify-center size-6 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-colors',
  },
  resizer: {
    handle:
      'absolute bottom-0 right-0 size-4 cursor-nwse-resize group/resize z-10 touch-none',
    grip:
      'absolute bottom-[3px] right-[3px] size-2.5 border-r-2 border-b-2 border-muted-foreground/40 group-hover/resize:border-foreground/70 transition-colors',
  },
} as const
