import type { GitInvokeResponse } from '../git.types'

interface RemoteAddOutput {
  stdout: string
}

export async function invokeGitRemoteAdd(params: {
  rootPath: string
  name: string
  url: string
}): Promise<string> {
  const res = (await window.api.gitRemoteAdd({
    rootPath: params.rootPath,
    name: params.name,
    url: params.url,
  })) as GitInvokeResponse<RemoteAddOutput>
  if (!res?.success || !res.data) {
    throw new Error(res?.error || 'Failed to add remote.')
  }
  return res.data.stdout
}
