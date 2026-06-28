import type { ContentWidth } from '@/store/settings-store'

/** A single content-width style definition. */
export interface ContentWidthStyle {
  /** Tailwind `max-w-*` class controlling the content column width. */
  maxWidth: string
  /**
   * Tailwind `max-w-*` class used when the content width should be relative to
   * the available container (e.g. a split pane) rather than an absolute pixel
   * column. Falls back to `maxWidth` when omitted.
   */
  relativeMaxWidth?: string
  /** Tailwind horizontal padding classes. Empty string = inherit the surface's default padding. */
  paddingX: string
  /** Human-readable label shown in selectors. */
  label: string
}

/** A selectable content-width option (value + label) for dropdowns and button groups. */
export interface ContentWidthOption {
  value: ContentWidth
  label: string
}

/** Resolved Tailwind classes for a given content width. */
export interface ContentWidthClasses {
  maxWidth: string
  paddingX: string
}
