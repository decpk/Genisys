/** Strip a path down to its last segment for use as a tab title. */
export function pickShellLabel(shell: string): string {
  if (!shell) return 'shell'
  const parts = shell.split(/[\\/]/)
  return parts[parts.length - 1] || shell
}
