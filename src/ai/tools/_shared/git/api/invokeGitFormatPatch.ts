import type { GitInvokeResponse } from '../git.types'

interface FormatPatchOutput {
  stdout: string
}

export async function invokeGitFormatPatch(params: {
  rootPath: string
  range: string
}): Promise<string> {
  const res = (await window.api.gitFormatPatch({
    rootPath: params.rootPath,
    range: params.range,
  })) as GitInvokeResponse<FormatPatchOutput>
  if (!res?.success || !res.data) {
    throw new Error(res?.error || 'Failed to format patch.')
  }
  return res.data.stdout
}
