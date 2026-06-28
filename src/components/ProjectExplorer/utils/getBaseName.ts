export function getBaseName(path: string): string {
  const trimmed = path.replace(/\/+$/, '')
  const lastSlash = trimmed.lastIndexOf('/')
  if (lastSlash === -1) return trimmed
  return trimmed.slice(lastSlash + 1)
}
