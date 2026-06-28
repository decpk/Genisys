import type { ContentWidth } from '@/store/settings-store'
import type { ContentWidthStyle } from './content-width.types'

/**
 * Single source of truth mapping every content-width mode to its layout styles.
 *
 * `paddingX` is only specified for modes that need to override the surface's
 * default horizontal padding. An empty `paddingX` means the consuming surface
 * keeps its own default padding (backward-compatible behavior).
 *
 * `full-inset` is "Full" width with the content inset by a fixed 24px (`px-6`)
 * horizontal padding, regardless of breakpoint.
 */
export const CONTENT_WIDTH_CONFIG: Record<ContentWidth, ContentWidthStyle> = {
  narrow: { maxWidth: 'max-w-xl', relativeMaxWidth: 'max-w-[55%]', paddingX: '', label: 'Narrow' },
  medium: { maxWidth: 'max-w-3xl', relativeMaxWidth: 'max-w-[70%]', paddingX: '', label: 'Medium' },
  wide: { maxWidth: 'max-w-5xl', relativeMaxWidth: 'max-w-[85%]', paddingX: '', label: 'Wide' },
  'full-inset': { maxWidth: 'max-w-none', relativeMaxWidth: 'max-w-none', paddingX: 'px-6 lg:px-6', label: 'Full width (inset)' },
  full: { maxWidth: 'max-w-none', relativeMaxWidth: 'max-w-none', paddingX: '', label: 'Full' },
}

/** Fallback mode used when a persisted/unknown width value is not in the config. */
export const DEFAULT_CONTENT_WIDTH: ContentWidth = 'full'

/**
 * Ordered list of content-width modes. `full-inset` is placed directly above
 * `full` so selectors render it in that position everywhere.
 */
export const CONTENT_WIDTH_ORDER: readonly ContentWidth[] = [
  'narrow',
  'medium',
  'wide',
  'full-inset',
  'full',
] as const
