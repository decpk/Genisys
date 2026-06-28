import type { ContentWidthOption } from './content-width.types'
import { CONTENT_WIDTH_CONFIG, CONTENT_WIDTH_ORDER } from './contentWidthConfig'

/**
 * Selectable content-width options (value + label) in display order, derived
 * from the shared config so labels and ordering never drift across surfaces.
 */
export const CONTENT_WIDTH_OPTIONS: readonly ContentWidthOption[] = CONTENT_WIDTH_ORDER.map(
  (value) => ({ value, label: CONTENT_WIDTH_CONFIG[value].label })
)
