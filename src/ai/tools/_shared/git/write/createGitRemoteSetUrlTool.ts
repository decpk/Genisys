import type { GitToolFactory } from '../git.types'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'
import { invokeGitRemoteSetUrl } from '../api/invokeGitRemoteSetUrl'
import { createConfirmAction } from '../utils/createConfirmAction'
import { formatGitOutput } from '../utils/formatGitOutput'
import { truncateOutput } from '../utils/truncateOutput'
import { withRepo } from '../utils/withRepo'

interface RemoteSetUrlArgs {
  name?: unknown
  url?: unknown
  push?: unknown
}

export const createGitRemoteSetUrlTool: GitToolFactory = (opts) => {
  const tool: ToolModule = {
    name: 'git_remote_set_url',
    definition: {
      type: 'function',
      function: {
        name: 'git_remote_set_url',
        description:
          'Change a remote\'s URL (`git remote set-url`). Use `push=true` to set only the push URL.',
        parameters: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Remote name to update.' },
            url: { type: 'string', description: 'New URL.' },
            push: { type: 'boolean', description: 'Set push URL only (preserves fetch URL).' },
          },
          required: ['name', 'url'],
        },
      },
    },
    execute: async (args): Promise<ToolResult> =>
      withRepo(opts, async (rootPath) => {
        const a = (args ?? {}) as RemoteSetUrlArgs
        const name = typeof a.name === 'string' ? a.name.trim() : ''
        const url = typeof a.url === 'string' ? a.url.trim() : ''
        const push = a.push === true
        if (!name) return { kind: 'error', message: '`name` is required.' }
        if (!url) return { kind: 'error', message: '`url` is required.' }
        return {
          kind: 'confirm-required',
          confirmAction: createConfirmAction({
            action: 'git_remote_set_url',
            description: `Set ${push ? 'push ' : ''}URL of '${name}' → ${url}`,
            items: [{ path: name, type: 'remote', details: url }],
            warning: 'Rewrites the remote URL in .git/config.',
            severity: 'caution',
          }),
          executeAfterConfirm: async () => {
            const stdout = await invokeGitRemoteSetUrl({ rootPath, name, url, push })
            opts.onMutate?.(rootPath, ['remotes'])
            return truncateOutput(`Updated remote '${name}'.\n\n${formatGitOutput(stdout)}`)
          },
        }
      }),
  }
  return tool
}
