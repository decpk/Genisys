import { joinRepoPath } from '../../../utils/joinRepoPath'

export interface OpenInVSCodeResult {
  success: boolean
  cliMissing: boolean
}

export async function handleOpenInVSCode(rootPath: string, repoRelativePath: string): Promise<OpenInVSCodeResult> {
  const fullPath = joinRepoPath(rootPath, repoRelativePath)
  const result = await window.api.openInVSCode(fullPath) as { success: boolean; error?: string }

  if (!result.success && result.error === 'cli_not_found') {
    return { success: false, cliMissing: true }
  }
  return { success: result.success, cliMissing: false }
}
