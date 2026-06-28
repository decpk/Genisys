import { pickShellLabel } from './pickShellLabel'

/** Format a tab title from session metadata. Falls back to the shell name. */
export function formatSessionTitle(
  index: number,
  shell: string,
  cwd: string | null | undefined
): string {
  const base = pickShellLabel(shell)
  if (cwd && cwd.length > 0) {
    const folder = cwd.split(/[\\/]/).filter(Boolean).pop()
    if (folder) return `${base} — ${folder}`
  }
  return `${base} ${index + 1}`
}
