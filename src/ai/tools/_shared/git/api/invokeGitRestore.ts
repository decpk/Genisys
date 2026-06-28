import type { GitInvokeResponse } from '../git.types'

interface GitRestoreOutput {
  stdout: string
}

/** `git restore`. Wraps `cmd_git_restore`. */
export async function invokeGitRestore(params: {
  rootPath: string
  paths: string[]
  source?: string
  staged?: boolean
  worktree?: boolean
}): Promise<string> {
  const res = (await window.api.gitRestore({
    rootPath: params.rootPath,
    paths: params.paths,
    source: params.source,
    staged: params.staged,
    worktree: params.worktree,
  })) as GitInvokeResponse<GitRestoreOutput>
  if (!res?.success || !res.data) {
    throw new Error(res?.error || 'Failed to restore.')
  }
  return res.data.stdout
}
