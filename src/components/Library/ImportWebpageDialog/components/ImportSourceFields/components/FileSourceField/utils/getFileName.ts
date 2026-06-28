/** Extract the file name (basename) from an absolute path. */
export function getFileName(path: string): string {
  const segments = path.split(/[\\/]/)
  return segments[segments.length - 1] || path
}
