import type { GitInvokeResponse } from '../git.types'

interface GitCleanOutput {
  stdout: string
}

/** `git clean`. Wraps `cmd_git_clean`. `dryRun=true` is non-destructive. */
export async function invokeGitClean(params: {
  rootPath: string
  paths?: string[]
  includeIgnored?: boolean
  includeDirectories?: boolean
  dryRun?: boolean
}): Promise<string> {
  const res = (await window.api.gitClean({
    rootPath: params.rootPath,
    paths: params.paths,
    includeIgnored: params.includeIgnored,
    includeDirectories: params.includeDirectories,
    dryRun: params.dryRun,
  })) as GitInvokeResponse<GitCleanOutput>
  if (!res?.success || !res.data) {
    throw new Error(res?.error || 'Failed to clean.')
  }
  return res.data.stdout
}
