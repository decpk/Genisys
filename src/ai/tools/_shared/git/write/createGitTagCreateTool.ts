import type { GitToolFactory } from '../git.types'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'
import { invokeGitTagCreate } from '../api/invokeGitTagCreate'
import { createConfirmAction } from '../utils/createConfirmAction'
import { formatGitOutput } from '../utils/formatGitOutput'
import { truncateOutput } from '../utils/truncateOutput'
import { withRepo } from '../utils/withRepo'

interface TagCreateArgs {
  name?: unknown
  refName?: unknown
  message?: unknown
  annotated?: unknown
}

export const createGitTagCreateTool: GitToolFactory = (opts) => {
  const tool: ToolModule = {
    name: 'git_tag_create',
    definition: {
      type: 'function',
      function: {
        name: 'git_tag_create',
        description:
          'Create a tag. Lightweight by default; pass `annotated=true` (or a `message`) to create an annotated tag. `refName` selects the commit to tag (default HEAD).',
        parameters: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'New tag name.' },
            refName: { type: 'string', description: 'Commit/ref to tag (default HEAD).' },
            message: { type: 'string', description: 'Annotated-tag message. Implies annotated.' },
            annotated: { type: 'boolean', description: 'Create an annotated tag (requires message).' },
          },
          required: ['name'],
        },
      },
    },
    execute: async (args): Promise<ToolResult> =>
      withRepo(opts, async (rootPath) => {
        const a = (args ?? {}) as TagCreateArgs
        const name = typeof a.name === 'string' ? a.name.trim() : ''
        const refName = typeof a.refName === 'string' && a.refName.trim() ? a.refName : undefined
        const message = typeof a.message === 'string' && a.message.trim() ? a.message : undefined
        const annotated = a.annotated === true || message !== undefined
        if (!name) return { kind: 'error', message: '`name` is required.' }
        return {
          kind: 'confirm-required',
          confirmAction: createConfirmAction({
            action: 'git_tag_create',
            description: `Create ${annotated ? 'annotated ' : ''}tag '${name}'${refName ? ` at ${refName}` : ''}`,
            items: [{ path: name, type: 'tag', details: refName ?? 'HEAD' }],
            warning: 'A new tag ref will be created. Reversible via git_tag_delete.',
            severity: 'caution',
          }),
          executeAfterConfirm: async () => {
            const stdout = await invokeGitTagCreate({
              rootPath,
              name,
              refName,
              message,
              annotated,
            })
            opts.onMutate?.(rootPath, ['refs', 'tags'])
            return truncateOutput(`Created tag '${name}'.\n\n${formatGitOutput(stdout)}`)
          },
        }
      }),
  }
  return tool
}
