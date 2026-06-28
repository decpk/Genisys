export async function readHtmlFileContent(absolutePath: string): Promise<string> {
  const result = await window.api.readTextFile(absolutePath)
  if (result.success && typeof result.data === 'string') {
    return result.data
  }
  throw new Error(result.error || 'Failed to read the selected file')
}
