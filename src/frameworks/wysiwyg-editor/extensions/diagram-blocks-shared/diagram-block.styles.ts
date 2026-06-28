/**
 * Shared Tailwind class constants for the live diagram/chart atom node views.
 * Mirrors the framing used by `DiagramCodeBlockNodeView` so the WYSIWYG editor
 * stays visually consistent between code-block and atom-node renderings.
 */
export const diagramBlockStyles = {
  wrapper:
    'my-4 rounded-xl border border-border/50 bg-muted/20 overflow-hidden',
  header:
    'flex items-center justify-between px-3 py-1.5 border-b border-border/30 bg-muted/30',
  badge: 'text-[10px] uppercase tracking-wider text-muted-foreground/60',
  toggle:
    'flex items-center gap-1 text-[10px] text-muted-foreground/50 hover:text-muted-foreground transition-colors cursor-pointer',
  preview: 'px-1 py-1',
  editor:
    'block w-full min-h-[120px] resize-y bg-transparent p-3 font-mono text-xs leading-relaxed text-foreground outline-none',
} as const
