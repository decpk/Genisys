export const quitConfirmModalStyles = {
  overlay:
    'fixed inset-0 z-[10000] bg-background/85 backdrop-blur-md data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 [background-image:radial-gradient(ellipse_at_top_left,oklch(0.62_0.21_27/0.18),transparent_55%),radial-gradient(ellipse_at_bottom_right,oklch(0.58_0.19_18/0.16),transparent_55%),radial-gradient(circle_at_50%_120%,oklch(0.55_0.22_30/0.14),transparent_60%)] [background-size:200%_200%,200%_200%,200%_200%] animate-quit-aurora',
  contentWrapper:
    'fixed inset-0 z-[10001] flex items-center justify-center p-6 outline-none data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
  card:
    'relative w-full max-w-6xl min-h-[640px] rounded-[28px] border border-border/40 bg-card/85 backdrop-blur-xl shadow-[0_40px_120px_-30px_rgba(0,0,0,0.55)] select-none overflow-hidden grid grid-cols-1 md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] ring-1 ring-white/5 isolate transform-gpu [clip-path:inset(0_round_28px)]',
  leftPane:
    'relative p-14 flex flex-col justify-between min-h-[640px] overflow-hidden rounded-tl-[28px] rounded-bl-[28px] md:rounded-tr-none md:rounded-br-none',
  leftPaneGlow:
    'pointer-events-none absolute -top-20 -left-20 h-72 w-72 rounded-full bg-destructive/10 blur-3xl',
  rightPane:
    'relative p-10 md:p-12 border-t md:border-t-0 md:border-l border-border/30 bg-gradient-to-br from-primary/[0.06] via-transparent to-primary/[0.14] flex flex-col gap-7 overflow-hidden rounded-tr-[28px] rounded-br-[28px] md:rounded-tl-none md:rounded-bl-none',
  rightPaneGlow:
    'pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-primary/15 blur-3xl',
  rightPaneGlowBottom:
    'pointer-events-none absolute -bottom-32 -left-16 h-64 w-64 rounded-full bg-primary/10 blur-3xl',
} as const
