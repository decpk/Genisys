export async function handleSoftDelete(rootPath: string, repoRelativePath: string): Promise<void> {
  const result = (await window.api.softDeleteItem(rootPath, repoRelativePath)) as {
    success: boolean
    error?: string
  }

  if (!result.success) {
    throw new Error(result.error ?? 'Failed to move to trash')
  }
}
