import type { GitInvokeResponse } from '../git.types'

interface SubmoduleStatusOutput {
  stdout: string
}

export async function invokeGitSubmoduleStatus(params: {
  rootPath: string
  recursive?: boolean
}): Promise<string> {
  const res = (await window.api.gitSubmoduleStatus({
    rootPath: params.rootPath,
    recursive: params.recursive,
  })) as GitInvokeResponse<SubmoduleStatusOutput>
  if (!res?.success || !res.data) {
    throw new Error(res?.error || 'Failed to read submodule status.')
  }
  return res.data.stdout
}
