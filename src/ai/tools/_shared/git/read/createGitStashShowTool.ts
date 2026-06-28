import type { GitToolFactory } from '../git.types'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'
import { invokeGitStashShow } from '../api/invokeGitStashShow'
import { formatGitOutput } from '../utils/formatGitOutput'
import { truncateOutput } from '../utils/truncateOutput'
import { withRepo } from '../utils/withRepo'

interface StashShowArgs {
  stashRef?: unknown
  format?: unknown
}

export const createGitStashShowTool: GitToolFactory = (opts) => {
  const tool: ToolModule = {
    name: 'git_stash_show',
    definition: {
      type: 'function',
      function: {
        name: 'git_stash_show',
        description:
          'Show the contents of a stash entry. With format="patch", returns the full diff; with format="stat" (default), returns a per-file summary.',
        parameters: {
          type: 'object',
          properties: {
            stashRef: {
              type: 'string',
              description: 'Stash reference (e.g. "stash@{0}"). Defaults to the most recent stash.',
            },
            format: {
              type: 'string',
              enum: ['patch', 'stat'],
              description: 'Output format: "patch" for full diff, "stat" for summary.',
            },
          },
        },
      },
    },
    execute: async (args): Promise<ToolResult> =>
      withRepo(opts, async (rootPath) => {
        const a = (args ?? {}) as StashShowArgs
        const stashRef = typeof a.stashRef === 'string' ? a.stashRef : undefined
        const format = a.format === 'patch' || a.format === 'stat' ? a.format : undefined
        try {
          const raw = await invokeGitStashShow({ rootPath, stashRef, format })
          return { kind: 'success', message: truncateOutput(formatGitOutput(raw)) }
        } catch (err) {
          return {
            kind: 'error',
            message: err instanceof Error ? err.message : 'git stash show failed',
          }
        }
      }),
  }
  return tool
}
