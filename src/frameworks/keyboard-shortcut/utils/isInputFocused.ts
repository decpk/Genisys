// ── Input focus check ────────────────────────────────────────────────

export function isInputFocused(): boolean {
  const active = document.activeElement
  if (!active) return false

  if (active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement) return true
  if ((active as HTMLElement).isContentEditable) return true

  return false
}
