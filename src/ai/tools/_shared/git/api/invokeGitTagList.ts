import type { GitInvokeResponse } from '../git.types'

interface TagListOutput {
  stdout: string
}

export async function invokeGitTagList(params: {
  rootPath: string
  pattern?: string
}): Promise<string> {
  const res = (await window.api.gitTagList({
    rootPath: params.rootPath,
    pattern: params.pattern,
  })) as GitInvokeResponse<TagListOutput>
  if (!res?.success || !res.data) {
    throw new Error(res?.error || 'Failed to list tags.')
  }
  return res.data.stdout
}
