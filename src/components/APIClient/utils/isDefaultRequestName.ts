/** Placeholder request names that are safe to overwrite when importing/parsing. */
const DEFAULT_REQUEST_NAMES = new Set(['', 'new request', 'imported request', 'untitled request'])

/** Returns true when `name` is an auto-generated placeholder (case-insensitive). */
export function isDefaultRequestName(name: string): boolean {
  return DEFAULT_REQUEST_NAMES.has(name.trim().toLowerCase())
}
