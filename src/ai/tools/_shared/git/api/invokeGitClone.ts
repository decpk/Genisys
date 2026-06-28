import type { GitInvokeResponse } from '../git.types'

interface CloneOutput {
  stdout: string
  stderr: string
  targetPath: string
}

export async function invokeGitClone(params: {
  url: string
  targetPath: string
  branch?: string
  depth?: number
}): Promise<CloneOutput> {
  const res = (await window.api.gitClone({
    url: params.url,
    targetPath: params.targetPath,
    branch: params.branch,
    depth: params.depth,
  })) as GitInvokeResponse<CloneOutput>
  if (!res?.success || !res.data) {
    throw new Error(res?.error || 'git clone failed.')
  }
  return res.data
}
