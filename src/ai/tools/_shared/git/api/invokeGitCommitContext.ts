import type { GitCommitContextData, GitInvokeResponse } from '../git.types'

interface InvokeGitCommitContextParams {
  rootPath: string
  /** Soft cap (in characters) for the diff body returned. */
  maxDiffChars?: number
  /** How many recent commit subjects to include. */
  recentMessages?: number
}

/**
 * Pre-bundles the staged diff and recent commit subjects so the LLM
 * has enough context to draft a commit message. Wraps
 * `cmd_git_get_commit_context`.
 */
export async function invokeGitCommitContext(
  params: InvokeGitCommitContextParams,
): Promise<GitCommitContextData> {
  const res = (await window.api.gitGetCommitContext({
    rootPath: params.rootPath,
    maxDiffChars: params.maxDiffChars,
    recentMessages: params.recentMessages,
  })) as GitInvokeResponse<GitCommitContextData>
  if (!res?.success || !res.data) {
    throw new Error(res?.error || 'Failed to load commit context.')
  }
  return res.data
}
