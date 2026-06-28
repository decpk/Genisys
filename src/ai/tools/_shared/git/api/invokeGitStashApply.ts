import type { GitInvokeResponse } from '../git.types'

interface GitStashRefOutput {
  stdout: string
}

/** Apply (but do not drop) a stash entry. Defaults to `stash@{0}`. */
export async function invokeGitStashApply(params: {
  rootPath: string
  stashRef?: string
}): Promise<string> {
  const res = (await window.api.gitStashApply({
    rootPath: params.rootPath,
    stashRef: params.stashRef,
  })) as GitInvokeResponse<GitStashRefOutput>
  if (!res?.success || !res.data) {
    throw new Error(res?.error || 'Failed to apply stash.')
  }
  return res.data.stdout
}
