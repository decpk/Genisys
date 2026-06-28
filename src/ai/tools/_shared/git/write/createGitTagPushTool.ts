import type { GitToolFactory } from '../git.types'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'
import { invokeGitTagPush } from '../api/invokeGitTagPush'
import { createConfirmAction } from '../utils/createConfirmAction'
import { formatGitOutput } from '../utils/formatGitOutput'
import { truncateOutput } from '../utils/truncateOutput'
import { withRepo } from '../utils/withRepo'

interface TagPushArgs {
  remote?: unknown
  name?: unknown
  all?: unknown
}

export const createGitTagPushTool: GitToolFactory = (opts) => {
  const tool: ToolModule = {
    name: 'git_tag_push',
    definition: {
      type: 'function',
      function: {
        name: 'git_tag_push',
        description:
          'Push tag(s) to a remote. Either `name` (single tag) or `all=true` (push all tags) must be set. `remote` defaults to "origin".',
        parameters: {
          type: 'object',
          properties: {
            remote: { type: 'string', description: 'Remote name (default "origin").' },
            name: { type: 'string', description: 'Tag name to push.' },
            all: { type: 'boolean', description: 'Push all tags (`--tags`).' },
          },
        },
      },
    },
    execute: async (args): Promise<ToolResult> =>
      withRepo(opts, async (rootPath) => {
        const a = (args ?? {}) as TagPushArgs
        const remote = typeof a.remote === 'string' && a.remote.trim() ? a.remote : 'origin'
        const name = typeof a.name === 'string' && a.name.trim() ? a.name : undefined
        const all = a.all === true
        if (!all && !name) {
          return { kind: 'error', message: 'Provide `name` or set `all=true`.' }
        }
        const target = all ? 'all tags' : `tag '${name}'`
        return {
          kind: 'confirm-required',
          confirmAction: createConfirmAction({
            action: 'git_tag_push',
            description: `Push ${target} → ${remote}`,
            items: [
              { path: remote, type: 'remote', details: all ? '--tags' : (name ?? '') },
            ],
            warning: 'Publishes tag ref(s) to the remote. Once pushed, others may rely on them.',
            severity: 'caution',
          }),
          executeAfterConfirm: async () => {
            const stdout = await invokeGitTagPush({ rootPath, remote, name, all })
            opts.onMutate?.(rootPath, ['refs'])
            return truncateOutput(`Pushed ${target} to ${remote}.\n\n${formatGitOutput(stdout)}`)
          },
        }
      }),
  }
  return tool
}
