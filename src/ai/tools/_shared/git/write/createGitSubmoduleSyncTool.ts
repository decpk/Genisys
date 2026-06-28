import type { GitToolFactory } from '../git.types'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'
import { invokeGitSubmoduleSync } from '../api/invokeGitSubmoduleSync'
import { createConfirmAction } from '../utils/createConfirmAction'
import { formatGitOutput } from '../utils/formatGitOutput'
import { truncateOutput } from '../utils/truncateOutput'
import { withRepo } from '../utils/withRepo'

interface SubmoduleSyncArgs {
  recursive?: unknown
}

export const createGitSubmoduleSyncTool: GitToolFactory = (opts) => {
  const tool: ToolModule = {
    name: 'git_submodule_sync',
    definition: {
      type: 'function',
      function: {
        name: 'git_submodule_sync',
        description:
          'Sync submodule URLs from `.gitmodules` into the local `.git/config` (`git submodule sync`). Use after upstream URLs change.',
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
        const a = (args ?? {}) as SubmoduleSyncArgs
        const recursive = a.recursive === true
        return {
          kind: 'confirm-required',
          confirmAction: createConfirmAction({
            action: 'git_submodule_sync',
            description: `Sync submodule URLs${recursive ? ' (--recursive)' : ''}`,
            items: [{ path: rootPath, type: 'repo' }],
            warning:
              'Rewrites recorded submodule URLs in .git/config to match .gitmodules.',
            severity: 'caution',
          }),
          executeAfterConfirm: async () => {
            const stdout = await invokeGitSubmoduleSync({ rootPath, recursive })
            opts.onMutate?.(rootPath, ['submodules', 'workdir'])
            return truncateOutput(`Submodule sync complete.\n\n${formatGitOutput(stdout)}`)
          },
        }
      }),
  }
  return tool
}
