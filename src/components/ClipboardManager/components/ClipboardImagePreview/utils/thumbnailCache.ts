/**
 * Module-level cache of clipboard thumbnail data URLs.
 *
 * Shared by all `ClipboardImagePreview` instances so virtualized list
 * mounts / unmounts (scrolling away and back) re-use already-decoded
 * thumbnail bytes instead of re-fetching them from the backend on every
 * remount.
 *
 * Keyed by `thumbnailPath` → base64 data URL. Mirrors the Map-export
 * precedent used by `ClipboardCodeView/utils/highlightCache.ts`.
 */
export const thumbnailCache: Map<string, string> = new Map()
