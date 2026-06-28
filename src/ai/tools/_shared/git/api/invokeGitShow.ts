import type { GitInvokeResponse } from '../git.types'

interface ShowOutput {
  stdout: string
}

export async function invokeGitShow(params: {
  rootPath: string
  refName: string
  path?: string
  maxLines?: number
}): Promise<string> {
  const res = (await window.api.gitShow({
    rootPath: params.rootPath,
    refName: params.refName,
    path: params.path,
    maxLines: params.maxLines,
  })) as GitInvokeResponse<ShowOutput>
  if (!res?.success || !res.data) {
    throw new Error(res?.error || 'git show failed.')
  }
  return res.data.stdout
}
