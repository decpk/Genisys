import type { GitInvokeResponse } from '../git.types'

interface TagDeleteOutput {
  stdout: string
}

export async function invokeGitTagDelete(params: {
  rootPath: string
  names: string[]
}): Promise<string> {
  const res = (await window.api.gitTagDelete({
    rootPath: params.rootPath,
    names: params.names,
  })) as GitInvokeResponse<TagDeleteOutput>
  if (!res?.success || !res.data) {
    throw new Error(res?.error || 'Failed to delete tag(s).')
  }
  return res.data.stdout
}
