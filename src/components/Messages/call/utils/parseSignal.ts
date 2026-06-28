import type {
  CallSignal,
  CallSignalKind,
} from '@/components/Messages/Messages.types'

const KNOWN_KINDS: ReadonlySet<CallSignalKind> = new Set<CallSignalKind>([
  'call-request',
  'accept',
  'reject',
  'busy',
  'cancel',
  'end',
  'offer',
  'answer',
  'candidate',
  'media-state',
])

/**
 * Strictly parses an opaque wire payload into a CallSignal.
 * Returns null on malformed JSON or when `t` is not a known signal kind.
 * Unknown / unexpected shapes are rejected (defense against injection).
 */
export function parseSignal(payload: string): CallSignal | null {
  let raw: unknown
  try {
    raw = JSON.parse(payload)
  } catch {
    return null
  }

  if (typeof raw !== 'object' || raw === null) return null
  const kind = (raw as { t?: unknown }).t
  if (typeof kind !== 'string') return null
  if (!KNOWN_KINDS.has(kind as CallSignalKind)) return null

  return raw as CallSignal
}
