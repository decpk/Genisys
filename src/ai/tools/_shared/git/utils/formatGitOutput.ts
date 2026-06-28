/**
 * Normalize raw git stdout/stderr for LLM consumption: strip ANSI
 * escape sequences and collapse CRLF to LF so downstream formatters
 * (and the LLM) work with a single canonical line ending.
 *
 * Pure utility — no truncation here; pair with `truncateOutput` if a
 * cap is required.
 */

// eslint-disable-next-line no-control-regex
const ANSI_RE = /\x1B\[[0-9;]*[A-Za-z]/g

export function formatGitOutput(raw: string): string {
  if (!raw) return ''
  return raw.replace(ANSI_RE, '').replace(/\r\n/g, '\n')
}
