export const priorityDotStyles = {
  // Inline-flex wrapper so the dot (and optional label) sit inline between the
  // checkbox/icon and the title without disturbing the row baseline.
  wrapper: 'shrink-0 inline-flex items-center gap-1.5',

  // Base dot — calm by default. Emphasized tiers add a soft ring halo inline
  // (box-shadow) so they read as "important" without shouting.
  dot: 'size-2 rounded-full',
  dotMuted: 'opacity-70',

  // Short uppercase label, only rendered for high-attention tiers.
  label: 'text-[9.5px] font-semibold uppercase tracking-wider leading-none',
} as const
