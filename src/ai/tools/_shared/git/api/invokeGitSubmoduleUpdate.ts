import type { GitInvokeResponse } from '../git.types'

interface SubmoduleUpdateOutput {
  stdout: string
}

export async function invokeGitSubmoduleUpdate(params: {
  rootPath: string
  init?: boolean
  recursive?: boolean
  paths?: string[]
}): Promise<string> {
  const res = (await window.api.gitSubmoduleUpdate({
    rootPath: params.rootPath,
    init: params.init,
    recursive: params.recursive,
    paths: params.paths,
  })) as GitInvokeResponse<SubmoduleUpdateOutput>
  if (!res?.success || !res.data) {
    throw new Error(res?.error || 'Failed to update submodule(s).')
  }
  return res.data.stdout
}
