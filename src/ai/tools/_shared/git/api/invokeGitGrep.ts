import type { GitInvokeResponse } from '../git.types'

interface GrepOutput {
  stdout: string
}

export async function invokeGitGrep(params: {
  rootPath: string
  pattern: string
  refName?: string
  includePattern?: string
  maxResults?: number
}): Promise<string> {
  const res = (await window.api.gitGrep({
    rootPath: params.rootPath,
    pattern: params.pattern,
    refName: params.refName,
    includePattern: params.includePattern,
    maxResults: params.maxResults,
  })) as GitInvokeResponse<GrepOutput>
  if (!res?.success || !res.data) {
    throw new Error(res?.error || 'git grep failed.')
  }
  return res.data.stdout
}
