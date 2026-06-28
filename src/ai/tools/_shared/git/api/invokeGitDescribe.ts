import type { GitInvokeResponse } from '../git.types'

interface DescribeOutput {
  stdout: string
}

export async function invokeGitDescribe(params: {
  rootPath: string
  refName?: string
  dirty?: boolean
  abbrev?: number
}): Promise<string> {
  const res = (await window.api.gitDescribe({
    rootPath: params.rootPath,
    refName: params.refName,
    dirty: params.dirty,
    abbrev: params.abbrev,
  })) as GitInvokeResponse<DescribeOutput>
  if (!res?.success || !res.data) {
    throw new Error(res?.error || 'git describe failed.')
  }
  return res.data.stdout
}
