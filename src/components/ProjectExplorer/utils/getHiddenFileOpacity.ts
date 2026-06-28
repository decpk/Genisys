/**
 * Returns the opacity to apply to a row representing a file/folder
 * whose name starts with a dot (hidden).
 *
 * Returns `0.6` only when ALL of the following are true:
 *   - `name` starts with `.`
 *   - `showHidden` is enabled (hidden files are visible)
 *   - `dimHidden` is enabled (user wants hidden files dimmed)
 *
 * Otherwise returns `1` (full opacity).
 */
export function getHiddenFileOpacity(
  name: string,
  showHidden: boolean,
  dimHidden: boolean
): number {
  if (!name.startsWith('.')) return 1
  if (!showHidden) return 1
  if (!dimHidden) return 1
  return 0.6
}
