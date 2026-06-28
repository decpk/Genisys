import type { GitInvokeResponse } from '../git.types'

interface InitOutput {
  stdout: string
  targetPath: string
}

export async function invokeGitInit(params: {
  targetPath: string
  bare?: boolean
  initialBranch?: string
}): Promise<InitOutput> {
  const res = (await window.api.gitInit({
    targetPath: params.targetPath,
    bare: params.bare,
    initialBranch: params.initialBranch,
  })) as GitInvokeResponse<InitOutput>
  if (!res?.success || !res.data) {
    throw new Error(res?.error || 'git init failed.')
  }
  return res.data
}
