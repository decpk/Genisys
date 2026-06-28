/** Human-readable file size (e.g. "2.4 MB"). */
export function formatBytes(n: number): string {
  if (!Number.isFinite(n) || n < 0) return ''
  if (n < 1024) return `${n} B`
  const units = ['KB', 'MB', 'GB', 'TB']
  let value = n
  let i = -1
  do {
    value /= 1024
    i++
  } while (value >= 1024 && i < units.length - 1)
  return `${value.toFixed(value < 10 ? 1 : 0)} ${units[i]}`
}

/** Short relative time (e.g. "just now", "5m ago"). */
export function formatRelativeTime(ms: number): string {
  const delta = Date.now() - ms
  if (delta < 60_000) return 'just now'
  if (delta < 3_600_000) return `${Math.floor(delta / 60_000)}m ago`
  if (delta < 86_400_000) return `${Math.floor(delta / 3_600_000)}h ago`
  try {
    return new Date(ms).toLocaleDateString()
  } catch {
    return ''
  }
}

/** Recipient value meaning "every connected device". */
export const TARGET_EVERYONE = 'everyone'

/** Connected devices deduped by stable device id (one entry per physical
 *  device), for the recipient picker. */
export function uniqueRecipients(
  clients: { deviceId: string; name: string }[],
): { deviceId: string; name: string }[] {
  const seen = new Set<string>()
  const out: { deviceId: string; name: string }[] = []
  for (const c of clients) {
    if (!c.deviceId || seen.has(c.deviceId)) continue
    seen.add(c.deviceId)
    out.push({ deviceId: c.deviceId, name: c.name || 'Device' })
  }
  return out
}

/** Human label for an item's recipient: "Everyone" or the device's name. */
export function recipientLabel(
  target: string,
  clients: { deviceId: string; name: string }[],
): string {
  if (!target || target === TARGET_EVERYONE) return 'Everyone'
  const match = clients.find((c) => c.deviceId === target)
  return match?.name || 'a device'
}
