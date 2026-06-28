export interface ThemeSwitcherProps {
  isCompact?: boolean
  size?: number
  side?: 'top' | 'bottom'
  /** Side the icon-only (compact) tooltip points to. Defaults to 'right'. */
  tooltipSide?: 'top' | 'bottom' | 'left' | 'right'
  /**
   * When true, the trigger renders as an icon + "Theme" label row (matching
   * the ActivityBar app buttons) instead of an icon-only button.
   */
  showLabel?: boolean
  /**
   * When `showLabel` is true, controls layout: `true` = left-aligned full-width
   * row (vertical bar); `false` = centered auto width (horizontal bar).
   */
  labelLeftAlign?: boolean
}
