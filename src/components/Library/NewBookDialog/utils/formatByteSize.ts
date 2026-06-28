export function formatByteSize(bytes: number): string {
  if (bytes < 1000) return `${bytes}b`
  if (bytes < 1_000_000) return `${(bytes / 1000).toFixed(1)}k`
  return `${(bytes / 1_000_000).toFixed(1)}M`
}
