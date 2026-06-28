import type { GitToolFactory } from '../git.types'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'
import { invokeGitRemoteAdd } from '../api/invokeGitRemoteAdd'
import { createConfirmAction } from '../utils/createConfirmAction'
import { formatGitOutput } from '../utils/formatGitOutput'
import { truncateOutput } from '../utils/truncateOutput'
import { withRepo } from '../utils/withRepo'

interface RemoteAddArgs {
  name?: unknown
  url?: unknown
}

export const createGitRemoteAddTool: GitToolFactory = (opts) => {
  const tool: ToolModule = {
    name: 'git_remote_add',
    definition: {
      type: 'function',
      function: {
        name: 'git_remote_add',
        description: 'Add a new remote (`git remote add <name> <url>`).',
        parameters: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Remote name (e.g. "origin", "upstream").' },
            url: { type: 'string', description: 'Remote URL (https or ssh).' },
          },
          required: ['name', 'url'],
        },
      },
    },
    execute: async (args): Promise<ToolResult> =>
      withRepo(opts, async (rootPath) => {
        const a = (args ?? {}) as RemoteAddArgs
        const name = typeof a.name === 'string' ? a.name.trim() : ''
        const url = typeof a.url === 'string' ? a.url.trim() : ''
        if (!name) return { kind: 'error', message: '`name` is required.' }
        if (!url) return { kind: 'error', message: '`url` is required.' }
        return {
          kind: 'confirm-required',
          confirmAction: createConfirmAction({
            action: 'git_remote_add',
            description: `Add remote '${name}' → ${url}`,
            items: [{ path: name, type: 'remote', details: url }],
            warning: 'Writes a new remote into .git/config. Reversible via git_remote_remove.',
            severity: 'caution',
          }),
          executeAfterConfirm: async () => {
            const stdout = await invokeGitRemoteAdd({ rootPath, name, url })
            opts.onMutate?.(rootPath, ['remotes'])
            return truncateOutput(`Added remote '${name}'.\n\n${formatGitOutput(stdout)}`)
          },
        }
      }),
  }
  return tool
}
