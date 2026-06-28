import type { GitInvokeResponse } from '../git.types'

interface GitStashRefOutput {
  stdout: string
}

/** Permanently remove a stash entry. Defaults to `stash@{0}`. */
export async function invokeGitStashDrop(params: {
  rootPath: string
  stashRef?: string
}): Promise<string> {
  const res = (await window.api.gitStashDrop({
    rootPath: params.rootPath,
    stashRef: params.stashRef,
  })) as GitInvokeResponse<GitStashRefOutput>
  if (!res?.success || !res.data) {
    throw new Error(res?.error || 'Failed to drop stash.')
  }
  return res.data.stdout
}
