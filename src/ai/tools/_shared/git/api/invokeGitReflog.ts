import type { GitInvokeResponse } from '../git.types'

interface GitReflogOutput {
  stdout: string
}

export async function invokeGitReflog(params: {
  rootPath: string
  refName?: string
  maxCount?: number
}): Promise<string> {
  const res = (await window.api.gitReflog({
    rootPath: params.rootPath,
    refName: params.refName,
    maxCount: params.maxCount,
  })) as GitInvokeResponse<GitReflogOutput>
  if (!res?.success || !res.data) {
    throw new Error(res?.error || 'Failed to read reflog.')
  }
  return res.data.stdout
}
