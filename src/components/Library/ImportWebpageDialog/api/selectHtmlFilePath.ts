export async function selectHtmlFilePath(): Promise<string | null> {
  const result = await window.api.selectHtmlFile()
  if (result.success) {
    return result.data
  }
  return null
}
