/**
 * Parse a `library-image://<bookId>/<filename>` (or the Windows
 * `https://library-image.localhost/<bookId>/<filename>` form Tauri
 * rewrites it to) and return the two path segments. Returns `null`
 * for URLs that don't match either shape.
 */
export interface ParsedLibraryImageUri {
  bookId: string
  filename: string
}

const LIBRARY_IMAGE_PREFIXES = [
  'library-image://',
  'https://library-image.localhost/',
  'http://library-image.localhost/',
] as const

export function parseLibraryImageUri(url: string): ParsedLibraryImageUri | null {
  if (!url) return null
  const prefix = LIBRARY_IMAGE_PREFIXES.find((p) => url.startsWith(p))
  if (!prefix) return null

  const tail = url.slice(prefix.length)
  // Strip any query string or hash — local files don't use them.
  const cleaned = tail.split('?')[0].split('#')[0]
  const parts = cleaned.split('/').filter(Boolean)
  if (parts.length < 2) return null

  const [bookId, ...rest] = parts
  return {
    bookId: decodeURIComponent(bookId),
    filename: decodeURIComponent(rest.join('/')),
  }
}
