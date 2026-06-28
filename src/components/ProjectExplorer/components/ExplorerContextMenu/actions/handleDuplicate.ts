import { addCopySuffix } from '../../../utils/addCopySuffix'

export async function handleDuplicate(
  rootPath: string,
  repoRelativePath: string,
  isFolder: boolean,
  operationId?: string
): Promise<void> {
  const destination = addCopySuffix(repoRelativePath, isFolder)
  const result = (await window.api.copyItem(
    rootPath,
    repoRelativePath,
    destination,
    undefined,
    operationId
  )) as {
    success: boolean
    error?: string
  }

  if (!result.success) {
    throw new Error(result.error ?? 'Failed to duplicate')
  }
}
