/**
 * Accent classes used throughout the Prompts app.
 *
 * The Prompts library uses a single, unified accent based on the
 * design-system `primary` token. Per-folder color customisation no
 * longer drives gradients or hue-specific tints — every folder reads
 * back the same primary-tone palette so the library matches the rest
 * of the app's primary theming.
 *
 * Class strings are static so Tailwind's JIT picks them up at build
 * time. Do not generate them dynamically.
 */
export interface FolderAccent {
  hex: string
  /** Solid background for active/highlighted surfaces. */
  gradient: string
  /** Solid-ish dot indicator for sidebar rows. */
  dot: string
  /** Soft tint for hover / selected sidebar rows. */
  soft: string
  /** Accent text colour for counts / labels. */
  text: string
  /** Subtle ring used on the prompt cards. */
  ring: string
  /** Glow halo behind the hero / card top edge. */
  glow: string
}

const PRIMARY_ACCENT: FolderAccent = {
  hex: '',
  gradient: 'bg-primary',
  dot: 'bg-primary',
  soft: 'bg-primary/10',
  text: 'text-primary',
  ring: 'ring-primary/30',
  glow: 'bg-primary/30',
}

export function getFolderAccent(color: string | undefined | null): FolderAccent {
  if (color) {
    return { ...PRIMARY_ACCENT, hex: color }
  }
  return PRIMARY_ACCENT
}
