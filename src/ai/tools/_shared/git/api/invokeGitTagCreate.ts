import type { GitInvokeResponse } from '../git.types'

interface TagCreateOutput {
  stdout: string
}

export async function invokeGitTagCreate(params: {
  rootPath: string
  name: string
  refName?: string
  message?: string
  annotated?: boolean
}): Promise<string> {
  const res = (await window.api.gitTagCreate({
    rootPath: params.rootPath,
    name: params.name,
    refName: params.refName,
    message: params.message,
    annotated: params.annotated,
  })) as GitInvokeResponse<TagCreateOutput>
  if (!res?.success || !res.data) {
    throw new Error(res?.error || 'Failed to create tag.')
  }
  return res.data.stdout
}
