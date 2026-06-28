import type { GitInvokeResponse } from '../git.types'

interface TagPushOutput {
  stdout: string
}

export async function invokeGitTagPush(params: {
  rootPath: string
  remote?: string
  name?: string
  all?: boolean
}): Promise<string> {
  const res = (await window.api.gitTagPush({
    rootPath: params.rootPath,
    remote: params.remote,
    name: params.name,
    all: params.all,
  })) as GitInvokeResponse<TagPushOutput>
  if (!res?.success || !res.data) {
    throw new Error(res?.error || 'Failed to push tag(s).')
  }
  return res.data.stdout
}
