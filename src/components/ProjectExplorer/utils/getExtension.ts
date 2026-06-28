export function getExtension(path: string): string {
  const name = path.split('/').pop() ?? ''
  const dotIndex = name.lastIndexOf('.')
  if (dotIndex <= 0) return ''
  return name.slice(dotIndex)
}
