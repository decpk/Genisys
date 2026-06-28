/**
 * Decode a URL-encoded segment, preserving `{{var}}` placeholders
 * literally and falling back to the raw value on malformed input.
 */
export function safeDecodeUriComponent(value: string): string {
  if (!value) return ''
  if (value.includes('{{') || value.includes('}}')) return value

  try {
    return decodeURIComponent(value.replace(/\+/g, ' '))
  } catch {
    return value
  }
}
