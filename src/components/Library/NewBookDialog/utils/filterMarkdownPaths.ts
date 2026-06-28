import { isMarkdownFilePath } from './isMarkdownFilePath'

/**
 * Filters a list of file paths down to those with a markdown extension.
 */
export function filterMarkdownPaths(paths: string[]): string[] {
  return paths.filter(isMarkdownFilePath)
}
