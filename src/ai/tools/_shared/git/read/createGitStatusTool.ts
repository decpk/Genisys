import type { GitToolFactory } from '../git.types'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'
import { invokeGitSnapshot } from '../api/invokeGitSnapshot'
import { formatStatusOutput } from '../utils/formatStatusOutput'
import { truncateOutput } from '../utils/truncateOutput'
import { withRepo } from '../utils/withRepo'

/**
 * Factory for the `git_status` tool. Returns the current branch,
 * upstream tracking, and categorized file lists (staged / unstaged /
 * untracked / merge) in a single call. The repo path is auto-resolved
 * via `opts.getRootPath` — the LLM never passes a path argument.
 */
export const createGitStatusTool: GitToolFactory = (opts) => {
  const tool: ToolModule = {
    name: 'git_status',
    definition: {
      type: 'function',
      function: {
        name: 'git_status',
        description:
          'Show the current git status: branch, upstream + ahead/behind counters, and lists of staged / unstaged / untracked / merge-conflict files. Operates on the currently open repository.',
        parameters: { type: 'object', properties: {} },
      },
    },
    execute: async (): Promise<ToolResult> =>
      withRepo(opts, async (rootPath) => {
        try {
          const snapshot = await invokeGitSnapshot(rootPath)
          return { kind: 'success', message: truncateOutput(formatStatusOutput(snapshot)) }
        } catch (err) {
          return { kind: 'error', message: err instanceof Error ? err.message : 'git status failed' }
        }
      }),
  }
  return tool
}
