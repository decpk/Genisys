/** Returns the last path segment (folder name) of an absolute path. */
export function folderName(path: string | null): string {
  if (!path) return 'Git'
  const trimmed = path.replace(/\/+$/, '')
  const segments = trimmed.split('/')
  return segments[segments.length - 1] || trimmed || 'Git'
}
