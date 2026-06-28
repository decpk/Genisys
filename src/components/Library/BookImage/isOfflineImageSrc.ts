/**
 * Returns true when an image src points at the Genisys offline cache.
 * We support both the canonical `library-image://` URI shape used on
 * macOS/Linux and the Windows `https://library-image.localhost/...` shape
 * Tauri rewrites to.
 */
export function isOfflineImageSrc(src: string | undefined): boolean {
  if (!src) return false
  return (
    src.startsWith('library-image://') ||
    src.startsWith('https://library-image.localhost/') ||
    src.startsWith('http://library-image.localhost/')
  )
}
