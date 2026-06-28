import type { ControlMessage } from '@/components/Messages/Messages.types'

const KNOWN_KINDS = new Set<ControlMessage['t']>(['reaction', 'ephemeral-timer'])

/**
 * Strictly parses an opaque wire payload into a ControlMessage. Returns null
 * for malformed JSON or an unrecognised discriminator so callers can safely
 * ignore unknown/forward-incompatible control frames.
 */
export function parseControl(payload: string): ControlMessage | null {
  let parsed: unknown
  try {
    parsed = JSON.parse(payload)
  } catch {
    return null
  }

  if (typeof parsed !== 'object' || parsed === null) return null
  const candidate = parsed as { t?: unknown }
  if (typeof candidate.t !== 'string') return null
  if (!KNOWN_KINDS.has(candidate.t as ControlMessage['t'])) return null

  return parsed as ControlMessage
}
