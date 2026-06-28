import type { GitToolFactory } from '../git.types'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'
import { invokeGitLog } from '../api/invokeGitLog'
import { formatLogEntries } from '../utils/formatLogEntries'
import { truncateOutput } from '../utils/truncateOutput'
import { withRepo } from '../utils/withRepo'

const DEFAULT_MAX_COUNT = 30
const HARD_CAP_MAX_COUNT = 200

/**
 * Factory for the `git_log` tool. Wraps `cmd_get_git_log` with optional
 * `maxCount` (default 30, clamped to 200) and `skip` for paging.
 */
export const createGitLogTool: GitToolFactory = (opts) => {
  const tool: ToolModule = {
    name: 'git_log',
    definition: {
      type: 'function',
      function: {
        name: 'git_log',
        description:
          'Read recent commits from the current repository. Returns short SHA, subject, author, ISO date, and ref names. Merge commits are excluded by the backend.',
        parameters: {
          type: 'object',
          properties: {
            maxCount: {
              type: 'number',
              description: `Number of commits to return. Default ${DEFAULT_MAX_COUNT}, max ${HARD_CAP_MAX_COUNT}.`,
            },
            skip: { type: 'number', description: 'Skip the first N commits (for paging).' },
          },
        },
      },
    },
    execute: async (args): Promise<ToolResult> =>
      withRepo(opts, async (rootPath) => {
        const requestedMax = typeof args.maxCount === 'number' ? args.maxCount : DEFAULT_MAX_COUNT
        const maxCount = Math.max(1, Math.min(requestedMax, HARD_CAP_MAX_COUNT))
        const skip = typeof args.skip === 'number' && args.skip > 0 ? args.skip : undefined
        try {
          const entries = await invokeGitLog({ rootPath, maxCount, skip })
          const header = `## Git log — ${entries.length} commits${skip ? ` (skip ${skip})` : ''}`
          return {
            kind: 'success',
            message: truncateOutput(`${header}\n\n${formatLogEntries(entries)}`),
          }
        } catch (err) {
          return { kind: 'error', message: err instanceof Error ? err.message : 'git log failed' }
        }
      }),
  }
  return tool
}
