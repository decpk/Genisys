import type { ContentWidth } from '@/store/settings-store'
import type { ContentWidthClasses } from '../content-width.types'
import { CONTENT_WIDTH_CONFIG, DEFAULT_CONTENT_WIDTH } from '../contentWidthConfig'

/**
 * Resolve the Tailwind classes for a given content-width mode.
 *
 * Returns `maxWidth` and `paddingX` separately so callers can merge them with
 * their own base classes via `cn()` (a non-empty `paddingX` overrides the
 * surface default through tailwind-merge). Unknown/stale persisted values fall
 * back to the default mode.
 *
 * Pass `{ relative: true }` to size the content column relative to its
 * container (e.g. a split pane) instead of an absolute pixel column; this uses
 * each mode's `relativeMaxWidth`, falling back to `maxWidth` when unset.
 */
export function getContentWidthClasses(
  width: ContentWidth,
  opts?: { relative?: boolean },
): ContentWidthClasses {
  const config = CONTENT_WIDTH_CONFIG[width] ?? CONTENT_WIDTH_CONFIG[DEFAULT_CONTENT_WIDTH]
  const maxWidth = opts?.relative ? config.relativeMaxWidth ?? config.maxWidth : config.maxWidth
  return { maxWidth, paddingX: config.paddingX }
}
