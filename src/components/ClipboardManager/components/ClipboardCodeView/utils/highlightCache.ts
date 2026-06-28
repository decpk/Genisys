/**
 * Module-level cache of Shiki HTML output.
 *
 * Shared by all `ClipboardCodeView` instances so virtualized list mounts /
 * unmounts re-use highlight HTML instead of re-running Shiki on every scroll.
 *
 * Keyed by `buildHighlightCacheKey(lang, theme, code)`.
 */
export const highlightCache: Map<string, string> = new Map()

/** Soft cap. Oldest entries are evicted FIFO when this is exceeded. */
export const HIGHLIGHT_CACHE_MAX_ENTRIES = 1024
