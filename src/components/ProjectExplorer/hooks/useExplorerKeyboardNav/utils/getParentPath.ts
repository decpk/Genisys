/**
 * Return the parent folder path for a given path. Returns null if already at root.
 * Paths use forward slashes; root is '/'.
 *
 *   '/'             → null
 *   '/foo'          → '/'
 *   '/foo/bar'      → '/foo'
 *   '/foo/bar/baz/' → '/foo/bar'
 */
export function getParentPath(path: string): string | null {
  if (!path || path === '/' || path === '') return null
  const trimmed = path.endsWith('/') ? path.slice(0, -1) : path
  const idx = trimmed.lastIndexOf('/')
  if (idx <= 0) return '/'
  return trimmed.slice(0, idx)
}
