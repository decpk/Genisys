import type { GitToolFactory } from '../git.types'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'
import { invokeGitRemoteRemove } from '../api/invokeGitRemoteRemove'
import { createConfirmAction } from '../utils/createConfirmAction'
import { formatGitOutput } from '../utils/formatGitOutput'
import { truncateOutput } from '../utils/truncateOutput'
import { withRepo } from '../utils/withRepo'

interface RemoteRemoveArgs {
  name?: unknown
}

export const createGitRemoteRemoveTool: GitToolFactory = (opts) => {
  const tool: ToolModule = {
    name: 'git_remote_remove',
    definition: {
      type: 'function',
      function: {
        name: 'git_remote_remove',
        description:
          'Remove a remote (`git remote remove <name>`). Orphans its remote-tracking branches in refs/remotes/<name>.',
        parameters: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Remote name to remove.' },
          },
          required: ['name'],
        },
      },
    },
    execute: async (args): Promise<ToolResult> =>
      withRepo(opts, async (rootPath) => {
        const a = (args ?? {}) as RemoteRemoveArgs
        const name = typeof a.name === 'string' ? a.name.trim() : ''
        if (!name) return { kind: 'error', message: '`name` is required.' }
        return {
          kind: 'confirm-required',
          confirmAction: createConfirmAction({
            action: 'git_remote_remove',
            description: `Remove remote '${name}'`,
            items: [{ path: name, type: 'remote' }],
            warning:
              'Drops the remote and orphans its remote-tracking branches. Re-add via git_remote_add if needed.',
            severity: 'danger',
          }),
          executeAfterConfirm: async () => {
            const stdout = await invokeGitRemoteRemove({ rootPath, name })
            opts.onMutate?.(rootPath, ['remotes'])
            return truncateOutput(`Removed remote '${name}'.\n\n${formatGitOutput(stdout)}`)
          },
        }
      }),
  }
  return tool
}
