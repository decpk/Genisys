/**
 * Pure helper used by the prompt-tab visual to pick a small swatch color
 * for the folder dot. Returns a CSS color string (or `undefined`
 * deliberately, so the consumer can fall back to a Tailwind class).
 */
export function getPromptTabFolderColor(
  folderColor: string | undefined,
): string | undefined {
  if (!folderColor) return undefined
  return folderColor
}
