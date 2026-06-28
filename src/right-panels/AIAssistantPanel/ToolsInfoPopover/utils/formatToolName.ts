export function formatToolName(name: string): string {
  return name
    .replace(/^[a-z]+_/, '') // remove prefix like "clipboard_"
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}
