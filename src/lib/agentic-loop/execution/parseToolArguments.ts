/** Discriminated union returned by `parseToolArguments`. */
export type ParseToolArgumentsResult =
  | { ok: true; value: Record<string, unknown> }
  | { ok: false; reason: string }

/**
 * Parse the `arguments` blob the model emits alongside a tool call.
 * Returns a discriminated union so callers can distinguish an empty-args
 * call from a malformed one.
 */
export function parseToolArguments(rawArguments: string): ParseToolArgumentsResult {
  if (rawArguments.length === 0) return { ok: true, value: {} }

  let parsed: unknown
  try {
    parsed = JSON.parse(rawArguments)
  } catch (err) {
    const reason = err instanceof Error ? err.message : 'JSON parse error'
    return { ok: false, reason }
  }

  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return { ok: false, reason: 'Tool arguments must be a JSON object' }
  }

  return { ok: true, value: parsed as Record<string, unknown> }
}
