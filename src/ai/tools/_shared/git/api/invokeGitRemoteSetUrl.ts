import type { GitInvokeResponse } from '../git.types'

interface RemoteSetUrlOutput {
  stdout: string
}

export async function invokeGitRemoteSetUrl(params: {
  rootPath: string
  name: string
  url: string
  push?: boolean
}): Promise<string> {
  const res = (await window.api.gitRemoteSetUrl({
    rootPath: params.rootPath,
    name: params.name,
    url: params.url,
    push: params.push,
  })) as GitInvokeResponse<RemoteSetUrlOutput>
  if (!res?.success || !res.data) {
    throw new Error(res?.error || 'Failed to set remote url.')
  }
  return res.data.stdout
}
