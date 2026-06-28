import type { GitInvokeResponse } from '../git.types'

interface RemoteRemoveOutput {
  stdout: string
}

export async function invokeGitRemoteRemove(params: {
  rootPath: string
  name: string
}): Promise<string> {
  const res = (await window.api.gitRemoteRemove({
    rootPath: params.rootPath,
    name: params.name,
  })) as GitInvokeResponse<RemoteRemoveOutput>
  if (!res?.success || !res.data) {
    throw new Error(res?.error || 'Failed to remove remote.')
  }
  return res.data.stdout
}
