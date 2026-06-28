import type { GitToolFactory, GitMutationKind } from '../git.types'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'
import { invokeGitReset, type GitResetMode } from '../api/invokeGitReset'
import { createConfirmAction } from '../utils/createConfirmAction'
import { formatGitOutput } from '../utils/formatGitOutput'
import { truncateOutput } from '../utils/truncateOutput'
import { withRepo } from '../utils/withRepo'

interface ResetArgs {
  target?: unknown
  mode?: unknown
}

const ALLOWED_MODES: GitResetMode[] = ['soft', 'mixed', 'hard']

export const createGitResetTool: GitToolFactory = (opts) => {
  const tool: ToolModule = {
    name: 'git_reset',
    definition: {
      type: 'function',
      function: {
        name: 'git_reset',
        description:
          'Move HEAD to a different commit/ref. `mode=soft` keeps the index and working tree; `mode=mixed` (git default) keeps the working tree but resets the index; `mode=hard` overwrites both — DESTRUCTIVE.',
        parameters: {
          type: 'object',
          properties: {
            target: { type: 'string', description: 'Commit, branch, tag, or ref expression.' },
            mode: {
              type: 'string',
              enum: ['soft', 'mixed', 'hard'],
              description: 'Reset mode.',
            },
          },
          required: ['target', 'mode'],
        },
      },
    },
    execute: async (args): Promise<ToolResult> =>
      withRepo(opts, async (rootPath) => {
        const a = (args ?? {}) as ResetArgs
        const target = typeof a.target === 'string' ? a.target.trim() : ''
        const mode =
          typeof a.mode === 'string' && (ALLOWED_MODES as string[]).includes(a.mode)
            ? (a.mode as GitResetMode)
            : null
        if (!target) return { kind: 'error', message: '`target` is required.' }
        if (!mode) return { kind: 'error', message: '`mode` must be soft, mixed, or hard.' }
        const isHard = mode === 'hard'
        return {
          kind: 'confirm-required',
          confirmAction: createConfirmAction({
            action: 'git_reset',
            description: `Reset --${mode} ${target}`,
            items: [{ path: rootPath, type: 'reset', details: `${mode} → ${target}` }],
            warning: isHard
              ? 'Working-tree and index changes will be OVERWRITTEN and cannot be recovered. HEAD moves to the target.'
              : `HEAD will move to ${target}. ${mode === 'soft' ? 'Index and working tree are preserved.' : 'Index is reset; working-tree changes are preserved.'}`,
            severity: isHard ? 'danger' : 'caution',
          }),
          executeAfterConfirm: async () => {
            const stdout = await invokeGitReset({ rootPath, target, mode })
            const kinds: GitMutationKind[] = isHard
              ? ['head', 'index', 'workdir']
              : ['head', 'index']
            opts.onMutate?.(rootPath, kinds)
            return truncateOutput(`Reset --${mode} ${target}.\n\n${formatGitOutput(stdout)}`)
          },
        }
      }),
  }
  return tool
}
