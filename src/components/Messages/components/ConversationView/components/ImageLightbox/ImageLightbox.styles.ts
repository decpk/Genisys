export const imageLightboxStyles = {
  trigger:
    'block max-w-[260px] overflow-hidden rounded-xl ring-1 ring-border/60 transition-transform hover:scale-[1.01] cursor-zoom-in',
  thumb: 'block h-auto w-full object-cover',
  overlay: 'fixed inset-0 z-50 bg-black/80 backdrop-blur-sm',
  content:
    'fixed left-1/2 top-1/2 z-50 flex max-h-[90vh] max-w-[92vw] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-3 outline-none',
  full: 'max-h-[82vh] max-w-[92vw] rounded-xl object-contain shadow-2xl',
  caption: 'flex items-center gap-2 text-[12px] text-white/70',
  close:
    'absolute -right-1 -top-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 cursor-pointer',
} as const
