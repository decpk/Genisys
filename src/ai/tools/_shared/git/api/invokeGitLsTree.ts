import type { GitInvokeResponse } from '../git.types'

interface LsTreeOutput {
  stdout: string
}

export async function invokeGitLsTree(params: {
  rootPath: string
  refName: string
  path?: string
  recursive?: boolean
}): Promise<string> {
  const res = (await window.api.gitLsTree({
    rootPath: params.rootPath,
    refName: params.refName,
    path: params.path,
    recursive: params.recursive,
  })) as GitInvokeResponse<LsTreeOutput>
  if (!res?.success || !res.data) {
    throw new Error(res?.error || 'git ls-tree failed.')
  }
  return res.data.stdout
}
