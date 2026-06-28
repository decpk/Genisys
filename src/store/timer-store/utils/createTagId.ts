export function createTagId(): string {
  return `tag-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}
