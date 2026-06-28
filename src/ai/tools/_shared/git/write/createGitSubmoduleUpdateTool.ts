import type { GitToolFactory } from '../git.types'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'
import { invokeGitSubmoduleUpdate } from '../api/invokeGitSubmoduleUpdate'
import { createConfirmAction } from '../utils/createConfirmAction'
import { formatGitOutput } from '../utils/formatGitOutput'
import { truncateOutput } from '../utils/truncateOutput'
import { withRepo } from '../utils/withRepo'

interface SubmoduleUpdateArgs {
  init?: unknown
  recursive?: unknown
  paths?: unknown
}

export const createGitSubmoduleUpdateTool: GitToolFactory = (opts) => {
  const tool: ToolModule = {
    name: 'git_submodule_update',
    definition: {
      type: 'function',
      function: {
        name: 'git_submodule_update',
        description:
          'Run `git submodule update` to check out the pinned commits of submodules. `init=true` initializes uninitialized ones; `recursive=true` recurses; `paths` limits scope.',
        parameters: {
          type: 'object',
          properties: {
            init: { type: 'boolean', description: 'Initialize uninitialized submodules.' },
            recursive: { type: 'boolean', description: 'Recurse into nested submodules.' },
            paths: {
              type: 'array',
              items: { type: 'string' },
              description: 'Optional submodule path filter.',
            },
          },
        },
      },
    },
    execute: async (args): Promise<ToolResult> =>
      withRepo(opts, async (rootPath) => {
        const a = (args ?? {}) as SubmoduleUpdateArgs
        const init = a.init === true
        const recursive = a.recursive === true
        const rawPaths = Array.isArray(a.paths) ? a.paths : []
        const paths = rawPaths.filter(
          (p): p is string => typeof p === 'string' && p.trim().length > 0,
        )
        const scope = paths.length > 0 ? ` (${paths.length} path(s))` : ''
        return {
          kind: 'confirm-required',
          confirmAction: createConfirmAction({
            action: 'git_submodule_update',
            description: `Update submodules${init ? ' (--init)' : ''}${recursive ? ' (--recursive)' : ''}${scope}`,
            items:
              paths.length > 0
                ? paths.map((p) => ({ path: p, type: 'submodule' as const }))
                : [{ path: rootPath, type: 'repo' as const }],
            warning:
              'May fetch and check out submodule commits. Modifies working trees inside submodule paths.',
            severity: 'caution',
          }),
          executeAfterConfirm: async () => {
            const stdout = await invokeGitSubmoduleUpdate({
              rootPath,
              init,
              recursive,
              paths: paths.length > 0 ? paths : undefined,
            })
            opts.onMutate?.(rootPath, ['submodules', 'workdir'])
            return truncateOutput(`Submodule update complete.\n\n${formatGitOutput(stdout)}`)
          },
        }
      }),
  }
  return tool
}
