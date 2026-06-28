import type { GitInvokeResponse } from '../git.types'

interface RemoteListOutput {
  stdout: string
}

export async function invokeGitRemoteList(rootPath: string): Promise<string> {
  const res = (await window.api.gitRemoteList({ rootPath })) as GitInvokeResponse<RemoteListOutput>
  if (!res?.success || !res.data) {
    throw new Error(res?.error || 'Failed to list remotes.')
  }
  return res.data.stdout
}
