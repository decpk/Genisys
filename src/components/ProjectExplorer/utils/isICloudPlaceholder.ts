export function isICloudPlaceholder(name: string): boolean {
  return name.startsWith('.') && name.endsWith('.icloud')
}
