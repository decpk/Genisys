import type { RepoItem } from '../../../ProjectExplorer.types'

export async function loadFolderChildren(
  rootPath: string,
  folderPath: string
): Promise<RepoItem[]> {
  const result = (await window.api.getLocalRepoItems({
    rootPath,
    path: folderPath,
    showHidden: false
  })) as { success: boolean; data?: RepoItem[]; error?: string }

  if (!result.success || !result.data) return []
  return result.data.filter((item) => item.isFolder)
}
