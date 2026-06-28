import type { GitToolFactory } from '../git.types'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'
import { invokeGitSubmoduleAdd } from '../api/invokeGitSubmoduleAdd'
import { createConfirmAction } from '../utils/createConfirmAction'
import { formatGitOutput } from '../utils/formatGitOutput'
import { truncateOutput } from '../utils/truncateOutput'
import { withRepo } from '../utils/withRepo'

interface SubmoduleAddArgs {
  repo?: unknown
  path?: unknown
}

export const createGitSubmoduleAddTool: GitToolFactory = (opts) => {
  const tool: ToolModule = {
    name: 'git_submodule_add',
    definition: {
      type: 'function',
      function: {
        name: 'git_submodule_add',
        description:
          'Register a new submodule and clone it (`git submodule add <repo> <path>`). Updates `.gitmodules` and stages the new submodule.',
        parameters: {
          type: 'object',
          properties: {
            repo: { type: 'string', description: 'Submodule repo URL.' },
            path: { type: 'string', description: 'Submodule directory path (relative to repo root).' },
          },
          required: ['repo', 'path'],
        },
      },
    },
    execute: async (args): Promise<ToolResult> =>
      withRepo(opts, async (rootPath) => {
        const a = (args ?? {}) as SubmoduleAddArgs
        const repo = typeof a.repo === 'string' ? a.repo.trim() : ''
        const path = typeof a.path === 'string' ? a.path.trim() : ''
        if (!repo) return { kind: 'error', message: '`repo` is required.' }
        if (!path) return { kind: 'error', message: '`path` is required.' }
        return {
          kind: 'confirm-required',
          confirmAction: createConfirmAction({
            action: 'git_submodule_add',
            description: `Add submodule ${repo} at ${path}`,
            items: [{ path, type: 'submodule', details: repo }],
            warning:
              'Clones a new submodule, writes .gitmodules, and stages the new submodule pointer. Reversible only with manual cleanup.',
            severity: 'danger',
          }),
          executeAfterConfirm: async () => {
            const stdout = await invokeGitSubmoduleAdd({ rootPath, repo, path })
            opts.onMutate?.(rootPath, ['submodules', 'workdir'])
            return truncateOutput(`Added submodule at ${path}.\n\n${formatGitOutput(stdout)}`)
          },
        }
      }),
  }
  return tool
}
