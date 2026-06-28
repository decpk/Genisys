import type { GitInvokeResponse } from '../git.types'

interface GitStashRefOutput {
  stdout: string
}

/** Pop a stash entry. Defaults to `stash@{0}`. */
export async function invokeGitStashPop(params: {
  rootPath: string
  stashRef?: string
}): Promise<string> {
  const res = (await window.api.gitStashPop({
    rootPath: params.rootPath,
    stashRef: params.stashRef,
  })) as GitInvokeResponse<GitStashRefOutput>
  if (!res?.success || !res.data) {
    throw new Error(res?.error || 'Failed to pop stash.')
  }
  return res.data.stdout
}
