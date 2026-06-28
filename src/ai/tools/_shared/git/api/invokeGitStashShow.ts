import type { GitInvokeResponse } from '../git.types'

interface GitStashShowOutput {
  stdout: string
}

/** Show a stash as patch or stat. Defaults to `format='stat'`, `ref=stash@{0}`. */
export async function invokeGitStashShow(params: {
  rootPath: string
  stashRef?: string
  format?: 'patch' | 'stat'
}): Promise<string> {
  const res = (await window.api.gitStashShow({
    rootPath: params.rootPath,
    stashRef: params.stashRef,
    format: params.format,
  })) as GitInvokeResponse<GitStashShowOutput>
  if (!res?.success || !res.data) {
    throw new Error(res?.error || 'Failed to show stash.')
  }
  return res.data.stdout
}
