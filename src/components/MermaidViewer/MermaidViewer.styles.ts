export const containerStyles = {
  base: [
    'group/mermaid relative rounded-xl border border-border/50 overflow-hidden transition-all duration-300',
    'bg-gradient-to-b from-card to-card/80',
    'hover:border-border/80 hover:shadow-sm',
  ],
  expanded: 'fixed inset-4 z-50 rounded-2xl border-border shadow-2xl flex flex-col',
  collapsed: 'my-4',
} as const

export const backdropStyles =
  'fixed inset-0 -z-10 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200'

export const headerStyles = [
  'flex items-center justify-between px-3.5 py-2',
  'border-b border-border/30',
  'bg-muted/30 backdrop-blur-sm',
] as const

export const zoomControlsStyles = [
  'flex items-center gap-0.5 mr-1 px-1 py-0.5 rounded-md',
  'bg-muted/50 border border-border/30',
  'opacity-0 group-hover/mermaid:opacity-100 transition-opacity duration-200',
] as const

export const actionsGroupStyles =
  'flex items-center gap-0.5 opacity-0 group-hover/mermaid:opacity-100 transition-opacity duration-200'

export const canvasGridStyles = {
  backgroundImage: 'radial-gradient(circle, currentColor 0.5px, transparent 0.5px)',
  backgroundSize: '16px 16px',
} as const

export const svgContainerStyles = [
  'mermaid-svg-container',
  '[&_svg]:max-w-full [&_svg]:h-auto',
  '[&_svg_text]:!font-sans',
  '[&_.node_rect]:!rx-[8px] [&_.node_rect]:!ry-[8px]',
  '[&_.edgePath_.path]:!stroke-[1.5px]',
  '[&_.cluster_rect]:!rx-[12px] [&_.cluster_rect]:!ry-[12px]',
] as const

export const footerStyles = [
  'flex items-center justify-between px-3.5 py-1.5',
  'border-t border-border/20',
  'bg-muted/20',
  'opacity-0 group-hover/mermaid:opacity-100 transition-opacity duration-200',
] as const

export const controlButtonStyles = [
  'flex items-center justify-center w-5 h-5 rounded-[4px]',
  'text-muted-foreground/50 hover:text-foreground hover:bg-muted/80',
  'transition-all duration-150 cursor-pointer',
  'active:scale-90',
] as const

export const errorStyles = {
  container:
    "my-4 rounded-xl border border-destructive/30 bg-destructive/[0.04] overflow-hidden",
  header:
    "flex items-center gap-2 px-4 py-2.5 border-b border-destructive/20 bg-destructive/[0.06]",
  body: "px-4 py-3",
  message: "text-xs text-destructive/80 whitespace-pre-wrap",
  source:
    "mt-2 text-xs text-muted-foreground whitespace-pre-wrap bg-muted/50 rounded-lg p-3",
} as const;
