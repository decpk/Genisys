import type { GitToolFactory } from '../git.types'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'
import { invokeGitTagDelete } from '../api/invokeGitTagDelete'
import { createConfirmAction } from '../utils/createConfirmAction'
import { formatGitOutput } from '../utils/formatGitOutput'
import { truncateOutput } from '../utils/truncateOutput'
import { withRepo } from '../utils/withRepo'

interface TagDeleteArgs {
  names?: unknown
}

export const createGitTagDeleteTool: GitToolFactory = (opts) => {
  const tool: ToolModule = {
    name: 'git_tag_delete',
    definition: {
      type: 'function',
      function: {
        name: 'git_tag_delete',
        description:
          'Delete one or more local tags (`git tag -d`). If the tag was already pushed, the remote copy survives — push deletion separately.',
        parameters: {
          type: 'object',
          properties: {
            names: {
              type: 'array',
              items: { type: 'string' },
              description: 'Tag names to delete.',
            },
          },
          required: ['names'],
        },
      },
    },
    execute: async (args): Promise<ToolResult> =>
      withRepo(opts, async (rootPath) => {
        const a = (args ?? {}) as TagDeleteArgs
        const raw = Array.isArray(a.names) ? a.names : []
        const names = raw.filter((n): n is string => typeof n === 'string' && n.trim().length > 0)
        if (names.length === 0) return { kind: 'error', message: '`names` must be a non-empty array of strings.' }
        return {
          kind: 'confirm-required',
          confirmAction: createConfirmAction({
            action: 'git_tag_delete',
            description: `Delete ${names.length} tag(s): ${names.join(', ')}`,
            items: names.map((n) => ({ path: n, type: 'tag' as const })),
            warning:
              'Deletes the local tag ref. If the tag was already pushed, the remote copy is unaffected.',
            severity: 'danger',
          }),
          executeAfterConfirm: async () => {
            const stdout = await invokeGitTagDelete({ rootPath, names })
            opts.onMutate?.(rootPath, ['refs', 'tags'])
            return truncateOutput(`Deleted ${names.length} tag(s).\n\n${formatGitOutput(stdout)}`)
          },
        }
      }),
  }
  return tool
}
