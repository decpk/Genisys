import type { GitToolFactory, GitMutationKind } from '../git.types'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'
import { invokeGitRestore } from '../api/invokeGitRestore'
import { createConfirmAction } from '../utils/createConfirmAction'
import { formatGitOutput } from '../utils/formatGitOutput'
import { truncateOutput } from '../utils/truncateOutput'
import { withRepo } from '../utils/withRepo'

interface RestoreArgs {
  paths?: unknown
  source?: unknown
  staged?: unknown
  worktree?: unknown
}

function coercePaths(v: unknown): string[] {
  if (!Array.isArray(v)) return []
  return v.filter((p): p is string => typeof p === 'string' && p.length > 0)
}

export const createGitRestoreTool: GitToolFactory = (opts) => {
  const tool: ToolModule = {
    name: 'git_restore',
    definition: {
      type: 'function',
      function: {
        name: 'git_restore',
        description:
          'Restore one or more file paths. With `staged=true`, unstages the file (matches working tree from index). With `worktree=true` (default), overwrites the working-tree file from the index or from `source`. Use `source=<ref>` to restore from a specific commit.',
        parameters: {
          type: 'object',
          properties: {
            paths: {
              type: 'array',
              items: { type: 'string' },
              description: 'Files / pathspecs to restore.',
            },
            source: {
              type: 'string',
              description: 'Optional ref/commit to restore from (e.g. "HEAD~1").',
            },
            staged: { type: 'boolean', description: 'Restore the index. Default false.' },
            worktree: {
              type: 'boolean',
              description: 'Restore the working tree. Default true when staged=false.',
            },
          },
          required: ['paths'],
        },
      },
    },
    execute: async (args): Promise<ToolResult> =>
      withRepo(opts, async (rootPath) => {
        const a = (args ?? {}) as RestoreArgs
        const paths = coercePaths(a.paths)
        const source = typeof a.source === 'string' && a.source ? a.source : undefined
        const staged = a.staged === true
        const worktree = a.worktree === true || !staged
        if (paths.length === 0) {
          return { kind: 'error', message: '`paths` must contain at least one entry.' }
        }
        return {
          kind: 'confirm-required',
          confirmAction: createConfirmAction({
            action: 'git_restore',
            description: `Restore ${paths.length} path(s)${source ? ` from ${source}` : ''}`,
            items: paths.map((p) => ({ path: p, type: 'file' })),
            warning: worktree
              ? 'Working-tree changes for the listed files will be overwritten.'
              : 'Staged changes for the listed files will be unstaged. Working tree is preserved.',
            severity: 'caution',
          }),
          executeAfterConfirm: async () => {
            const stdout = await invokeGitRestore({
              rootPath,
              paths,
              source,
              staged,
              worktree,
            })
            const kinds: GitMutationKind[] = []
            if (staged) kinds.push('index')
            if (worktree) kinds.push('workdir')
            if (kinds.length > 0) opts.onMutate?.(rootPath, kinds)
            return truncateOutput(`Restored ${paths.length} path(s).\n\n${formatGitOutput(stdout)}`)
          },
        }
      }),
  }
  return tool
}
