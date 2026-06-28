// Lines that begin with a shell prompt prefix (e.g. "$ ", "> ", "# ") are a strong signal.
const SHELL_PREFIX_LINE = /^\s*(\$|>|#)\s+\S/m

// Distinctive command names that are unlikely to appear in plain prose. These can match
// at the start of any line, but must still be followed by an argument (flag, path, etc.)
// so that prose like "I love git" or "use npm" doesn't trigger.
const STRONG_COMMAND_LINE =
  /^\s*(?:sudo\s+)?(git|npm|npx|yarn|pnpm|docker|kubectl|brew|apt|pip|cargo|rustc|gcc|clang|chmod|chown|mkdir|rmdir|xargs|curl|wget|ssh|scp|rsync|tar|zip|unzip)\b\s+\S/m

// Common Unix commands that are also everyday English words. Only count these when they
// appear at the start of a line AND are followed by a shell-arg-shaped token (a flag,
// path-like fragment, filename with extension, glob, quote, or pipe/redirect operator).
const AMBIGUOUS_COMMAND_LINE =
  /^\s*(?:sudo\s+)?(make|find|cat|cd|cp|mv|rm|ls|echo|source|go|java|node|python|ruby|grep|sed|awk|alias|export)\b\s+(?:-{1,2}[\w-]+|\.{1,2}(?=[/\s]|$)|\/[\w/.-]*|~\/?|\*|["']|[\w-]+\.[\w-]+|\$[\w{]|\||&&|\|\||>>?|<<?|2>)/m

// Fallback for ambiguous commands whose first arg is a bare word but a redirect or pipe
// operator appears later on the same line (e.g. `echo hi > out.txt`).
const AMBIGUOUS_COMMAND_WITH_OPERATOR =
  /^\s*(?:sudo\s+)?(make|find|cat|cd|cp|mv|rm|ls|echo|source|go|java|node|python|ruby|grep|sed|awk|alias|export)\b[^\n]*\s(?:\||&&|\|\||>>?|2>)\s/m

export function detectShellCommand(text: string): boolean {
  const trimmed = text.trim()
  if (trimmed.length < 3 || trimmed.length > 2000) return false

  const lines = trimmed.split('\n')
  if (lines.length > 20) return false

  if (SHELL_PREFIX_LINE.test(trimmed)) return true
  if (STRONG_COMMAND_LINE.test(trimmed)) return true
  if (AMBIGUOUS_COMMAND_LINE.test(trimmed)) return true
  if (AMBIGUOUS_COMMAND_WITH_OPERATOR.test(trimmed)) return true

  return false
}
