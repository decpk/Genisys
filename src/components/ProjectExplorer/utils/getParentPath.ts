export function getParentPath(repoRelativePath: string): string {
  const trimmed = repoRelativePath.replace(/\/+$/, '')
  const lastSlash = trimmed.lastIndexOf('/')
  if (lastSlash <= 0) return '/'
  return trimmed.slice(0, lastSlash)
}
