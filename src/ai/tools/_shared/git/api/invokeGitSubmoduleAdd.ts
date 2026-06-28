import type { GitInvokeResponse } from '../git.types'

interface SubmoduleAddOutput {
  stdout: string
}

export async function invokeGitSubmoduleAdd(params: {
  rootPath: string
  repo: string
  path: string
}): Promise<string> {
  const res = (await window.api.gitSubmoduleAdd({
    rootPath: params.rootPath,
    repo: params.repo,
    path: params.path,
  })) as GitInvokeResponse<SubmoduleAddOutput>
  if (!res?.success || !res.data) {
    throw new Error(res?.error || 'Failed to add submodule.')
  }
  return res.data.stdout
}
