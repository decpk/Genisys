import type { GitInvokeResponse } from '../git.types'

interface ArchiveOutput {
  outputPath?: string
  bytes?: number
  format: string
}

export async function invokeGitArchive(params: {
  rootPath: string
  refName: string
  format?: string
  outputPath?: string
}): Promise<ArchiveOutput> {
  const res = (await window.api.gitArchive({
    rootPath: params.rootPath,
    refName: params.refName,
    format: params.format,
    outputPath: params.outputPath,
  })) as GitInvokeResponse<ArchiveOutput>
  if (!res?.success || !res.data) {
    throw new Error(res?.error || 'Failed to archive.')
  }
  return res.data
}
