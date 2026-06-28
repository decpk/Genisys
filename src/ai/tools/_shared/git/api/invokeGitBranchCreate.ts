import type { GitInvokeResponse } from '../git.types'

interface GitBranchOutput {
  stdout: string
}

export interface InvokeGitBranchCreateParams {
  rootPath: string
  name: string
  startPoint?: string
  checkout?: boolean
}

/** Create a branch (optionally checking it out). Wraps `cmd_git_branch_create`. */
export async function invokeGitBranchCreate(params: InvokeGitBranchCreateParams): Promise<string> {
  const res = (await window.api.gitBranchCreate({
    rootPath: params.rootPath,
    name: params.name,
    startPoint: params.startPoint,
    checkout: params.checkout,
  })) as GitInvokeResponse<GitBranchOutput>
  if (!res?.success || !res.data) {
    throw new Error(res?.error || 'Failed to create branch.')
  }
  return res.data.stdout
}
