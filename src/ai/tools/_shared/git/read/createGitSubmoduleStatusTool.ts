import type { GitToolFactory } from '../git.types'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'
import { invokeGitSubmoduleStatus } from '../api/invokeGitSubmoduleStatus'
import { formatGitOutput } from '../utils/formatGitOutput'
import { truncateOutput } from '../utils/truncateOutput'
import { withRepo } from '../utils/withRepo'

interface SubmoduleStatusArgs {
  recursive?: unknown
}

export const createGitSubmoduleStatusTool: GitToolFactory = (opts) => {
  const tool: ToolModule = {
    name: 'git_submodule_status',
    definition: {
      type: 'function',
      function: {
        name: 'git_submodule_status',
        description:
          'Show submodule status (`git submodule status`). Use `recursive=true` to recurse into nested submodules.',
        parameters: {
          type: 'object',
          properties: {
            recursive: { type: 'boolean', description: 'Recurse into nested submodules.' },
          },
        },
      },
    },
    execute: async (args): Promise<ToolResult> =>
      withRepo(opts, async (rootPath) => {
        const a = (args ?? {}) as SubmoduleStatusArgs
        const recursive = a.recursive === true
        try {
          const stdout = await invokeGitSubmoduleStatus({ rootPath, recursive })
          if (!stdout.trim()) {
            return { kind: 'success', message: 'No submodules.' }
          }
          return { kind: 'success', message: truncateOutput(formatGitOutput(stdout)) }
        } catch (err) {
          return {
            kind: 'error',
            message: err instanceof Error ? err.message : 'git submodule status failed',
          }
        }
      }),
  }
  return tool
}
