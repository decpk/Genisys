import type { GitToolFactory } from '../git.types'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'
import { invokeGitTagList } from '../api/invokeGitTagList'
import { formatGitOutput } from '../utils/formatGitOutput'
import { truncateOutput } from '../utils/truncateOutput'
import { withRepo } from '../utils/withRepo'

interface TagListArgs {
  pattern?: unknown
}

export const createGitTagListTool: GitToolFactory = (opts) => {
  const tool: ToolModule = {
    name: 'git_tag_list',
    definition: {
      type: 'function',
      function: {
        name: 'git_tag_list',
        description:
          'List local tags. Optional `pattern` (e.g. "v1.*") filters via `git tag --list <pattern>`.',
        parameters: {
          type: 'object',
          properties: {
            pattern: { type: 'string', description: 'Optional glob to filter tags.' },
          },
        },
      },
    },
    execute: async (args): Promise<ToolResult> =>
      withRepo(opts, async (rootPath) => {
        const a = (args ?? {}) as TagListArgs
        const pattern =
          typeof a.pattern === 'string' && a.pattern.trim() ? a.pattern : undefined
        try {
          const stdout = await invokeGitTagList({ rootPath, pattern })
          if (!stdout.trim()) {
            return { kind: 'success', message: 'No tags.' }
          }
          return { kind: 'success', message: truncateOutput(formatGitOutput(stdout)) }
        } catch (err) {
          return {
            kind: 'error',
            message: err instanceof Error ? err.message : 'git tag --list failed',
          }
        }
      }),
  }
  return tool
}
