/**
 * Tailwind class strings for the main-content drag-drop overlay. The overlay
 * fills the content area and is sliced into two stacked zones (top = open in a
 * new window, bottom = disable). The whole layer is `pointer-events-none` so it
 * never intercepts the `@dnd-kit` pointer — it is purely visual feedback.
 */
export const appDropZonesStyles = {
  overlay: 'pointer-events-none absolute inset-0 z-[60] flex flex-col gap-2 p-2',
  zone: 'flex flex-1 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed backdrop-blur-sm transition-colors duration-150',
  // The "open in new window" zone is always a cloud-white frosted surface.
  windowIdle: 'border-white/60 bg-white/10 text-foreground',
  windowActive: 'border-white bg-white/25 text-foreground',
  disableIdle: 'border-destructive/40 bg-destructive/5 text-destructive/80',
  disableActive: 'border-destructive bg-destructive/15 text-destructive',
  iconWrap: 'flex size-12 items-center justify-center rounded-xl border shadow-sm',
  windowIconWrap: 'border-white/60 bg-white/20',
  disableIconWrap: 'border-destructive/30 bg-destructive/10',
  label: 'text-sm font-semibold',
  sublabel: 'flex items-center gap-1.5 text-xs opacity-70',
} as const
