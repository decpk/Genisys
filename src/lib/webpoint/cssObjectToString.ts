function camelToKebab(key: string): string {
  return key.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)
}

/**
 * Serialize a camelCase style map (the same shape React's `style` prop accepts)
 * into an inline CSS declaration string for the compiled slide HTML.
 */
export function cssObjectToString(style: Record<string, string>): string {
  return Object.entries(style)
    .map(([key, value]) => `${camelToKebab(key)}:${value}`)
    .join(';')
}
