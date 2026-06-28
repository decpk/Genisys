import type { GitToolFactory } from '../git.types'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'
import { invokeGitClone } from '../api/invokeGitClone'
import { createConfirmAction } from '../utils/createConfirmAction'
import { formatGitOutput } from '../utils/formatGitOutput'
import { truncateOutput } from '../utils/truncateOutput'

interface CloneArgs {
  url?: unknown
  targetPath?: unknown
  branch?: unknown
  depth?: unknown
}

/**
 * Factory for `git_clone`. Operates on a target path that lives
 * **outside** any currently-open repo, so it bypasses `withRepo` and
 * validates the destination directly.
 */
export const createGitCloneTool: GitToolFactory = () => {
  const tool: ToolModule = {
    name: 'git_clone',
    definition: {
      type: 'function',
      function: {
        name: 'git_clone',
        description:
          'Clone a remote repository to a local target path. The target must not already exist; its parent must.',
        parameters: {
          type: 'object',
          properties: {
            url: { type: 'string', description: 'Remote URL (https or ssh).' },
            targetPath: { type: 'string', description: 'Absolute destination path (must not exist).' },
            branch: { type: 'string', description: 'Optional branch to clone (`--branch <name>`).' },
            depth: { type: 'number', description: 'Optional shallow-clone depth (`--depth N`).' },
          },
          required: ['url', 'targetPath'],
        },
      },
    },
    execute: async (rawArgs): Promise<ToolResult> => {
      const a = (rawArgs ?? {}) as CloneArgs
      const url = typeof a.url === 'string' ? a.url.trim() : ''
      const targetPath = typeof a.targetPath === 'string' ? a.targetPath.trim() : ''
      if (!url) return { kind: 'error', message: '`url` is required.' }
      if (!targetPath) return { kind: 'error', message: '`targetPath` is required.' }
      const branch = typeof a.branch === 'string' && a.branch.trim() ? a.branch.trim() : undefined
      const depth =
        typeof a.depth === 'number' && Number.isFinite(a.depth) && a.depth > 0
          ? Math.floor(a.depth)
          : undefined
      return {
        kind: 'confirm-required',
        confirmAction: createConfirmAction({
          action: 'git_clone',
          description: `Clone ${url} → ${targetPath}${branch ? ` (branch ${branch})` : ''}${depth ? ` (depth ${depth})` : ''}`,
          items: [{ path: targetPath, type: 'repo', details: url }],
          warning:
            'Network operation — may transfer a large amount of data. The target directory will be created and populated.',
          severity: 'danger',
        }),
        executeAfterConfirm: async () => {
          const data = await invokeGitClone({ url, targetPath, branch, depth })
          const out = [data.stdout, data.stderr].filter((s) => s && s.trim()).join('\n')
          return truncateOutput(`Cloned to ${data.targetPath}.\n\n${formatGitOutput(out)}`)
        },
      }
    },
  }
  return tool
}
