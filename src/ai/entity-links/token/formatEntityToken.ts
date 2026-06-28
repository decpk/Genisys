export function formatEntityToken(type: string, id: string, label?: string): string {
  // Sanitize id/label by stripping forbidden chars so the produced token is always parseable.
  const safeId = String(id).replace(/[:|\]\n]/g, '')
  if (label === undefined || label === null) return `[[entity:${type}:${safeId}]]`
  const safeLabel = String(label).replace(/[\]\n]/g, '').trim()
  if (!safeLabel) return `[[entity:${type}:${safeId}]]`
  return `[[entity:${type}:${safeId}|${safeLabel}]]`
}
