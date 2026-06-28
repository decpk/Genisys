import type { GitInvokeResponse } from '../git.types'

interface ApplyPatchOutput {
  stdout: string
  stderr: string
}

export async function invokeGitApplyPatch(params: {
  rootPath: string
  patchText: string
  check?: boolean
  threeWay?: boolean
}): Promise<{ stdout: string; stderr: string }> {
  const res = (await window.api.gitApplyPatch({
    rootPath: params.rootPath,
    patchText: params.patchText,
    check: params.check,
    threeWay: params.threeWay,
  })) as GitInvokeResponse<ApplyPatchOutput>
  if (!res?.success || !res.data) {
    throw new Error(res?.error || 'Failed to apply patch.')
  }
  return res.data
}
