/** Soft cap (in characters) on tool output bodies returned to the LLM. */
const DEFAULT_MAX_CHARS = 30_000

/**
 * Cap a long output body so the LLM context stays manageable. Appends
 * a clear truncation marker when the input exceeds the cap.
 */
export function truncateOutput(body: string, maxChars: number = DEFAULT_MAX_CHARS): string {
  if (body.length <= maxChars) return body
  const head = body.slice(0, maxChars)
  const omitted = body.length - maxChars
  return `${head}\n\n… (truncated — ${omitted.toLocaleString()} more characters omitted)`
}
