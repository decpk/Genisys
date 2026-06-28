const HALLUCINATION_PATTERNS = [
  /^\[.*\]$/,
  /^\(.*\)$/,
  /^blank[_ ]audio$/i,
  /^inaudible$/i,
  /^indistinct$/i,
  /^thank you\.?$/i,
  /^thanks for watching\.?$/i,
  /^you$/i,
  /^\.$/,
]

/**
 * Returns `true` if the transcribed text is a known Whisper hallucination.
 * These patterns occur when Whisper processes silence or very quiet audio.
 */
export function isHallucination(text: string): boolean {
  const trimmed = text.trim()
  if (!trimmed) return true
  return HALLUCINATION_PATTERNS.some((pattern) => pattern.test(trimmed))
}
