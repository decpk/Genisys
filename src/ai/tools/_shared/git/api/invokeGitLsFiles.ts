import type { GitInvokeResponse } from '../git.types'

interface LsFilesOutput {
  stdout: string
}

export async function invokeGitLsFiles(params: {
  rootPath: string
  patterns?: string[]
  staged?: boolean
  modified?: boolean
  untracked?: boolean
}): Promise<string> {
  const res = (await window.api.gitLsFiles({
    rootPath: params.rootPath,
    patterns: params.patterns,
    staged: params.staged,
    modified: params.modified,
    untracked: params.untracked,
  })) as GitInvokeResponse<LsFilesOutput>
  if (!res?.success || !res.data) {
    throw new Error(res?.error || 'git ls-files failed.')
  }
  return res.data.stdout
}
