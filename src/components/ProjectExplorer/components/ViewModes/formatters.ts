export function formatFileSize(bytes: number | undefined): string {
  if (bytes === undefined) return '—'
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  const size = bytes / Math.pow(1024, i)
  return `${i === 0 ? size : size.toFixed(1)} ${units[i]}`
}

// Caches for date formatting — keyed by ISO string, avoids re-creating Date objects per render
const smartDateCache = new Map<string, string>()
const absoluteDateCache = new Map<string, string>()
const MAX_DATE_CACHE = 2000

export function formatAbsoluteDate(iso: string | undefined): string {
  if (!iso) return '—'
  const cached = absoluteDateCache.get(iso)
  if (cached) return cached
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  const result =
    d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) +
    ' · ' +
    d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
  if (absoluteDateCache.size >= MAX_DATE_CACHE) absoluteDateCache.clear()
  absoluteDateCache.set(iso, result)
  return result
}

export function formatSmartDate(iso: string | undefined): string {
  if (!iso) return '—'
  // Bucket by minute so relative "Xm ago" doesn't go stale within a render pass
  const minuteKey = `${iso}|${Math.floor(Date.now() / 60000)}`
  const cached = smartDateCache.get(minuteKey)
  if (cached) return cached
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'

  const now = Date.now()
  const diffMs = now - d.getTime()
  const SEC = 1000
  const MIN = 60 * SEC
  const HOUR = 60 * MIN
  const DAY = 24 * HOUR
  const WEEK = 7 * DAY

  let result: string

  if (diffMs < 0) {
    // Future date → fall through to absolute
    const sameYear = d.getFullYear() === new Date().getFullYear()
    result = d.toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
      ...(sameYear ? {} : { year: 'numeric' })
    })
  } else if (diffMs < MIN) {
    result = 'just now'
  } else if (diffMs < HOUR) {
    result = `${Math.floor(diffMs / MIN)}m ago`
  } else if (diffMs < DAY) {
    result = `${Math.floor(diffMs / HOUR)}h ago`
  } else if (diffMs < WEEK) {
    result = `${Math.floor(diffMs / DAY)}d ago`
  } else {
    const sameYear = d.getFullYear() === new Date().getFullYear()
    result = d.toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
      ...(sameYear ? {} : { year: 'numeric' })
    })
  }

  if (smartDateCache.size >= MAX_DATE_CACHE) smartDateCache.clear()
  smartDateCache.set(minuteKey, result)
  return result
}

export function getExtension(name: string, isFolder: boolean): string | null {
  if (isFolder) return null
  const dot = name.lastIndexOf('.')
  if (dot <= 0) return null // no dot, or dotfile like ".env"
  return name.slice(dot + 1).toLowerCase()
}
