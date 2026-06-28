import type { GitInvokeResponse } from '../git.types'

interface SubmoduleSyncOutput {
  stdout: string
}

export async function invokeGitSubmoduleSync(params: {
  rootPath: string
  recursive?: boolean
}): Promise<string> {
  const res = (await window.api.gitSubmoduleSync({
    rootPath: params.rootPath,
    recursive: params.recursive,
  })) as GitInvokeResponse<SubmoduleSyncOutput>
  if (!res?.success || !res.data) {
    throw new Error(res?.error || 'Failed to sync submodule(s).')
  }
  return res.data.stdout
}
