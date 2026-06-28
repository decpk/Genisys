import type { GitToolFactory, GitMutationKind } from '../git.types'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'
import { invokeGitApplyPatch } from '../api/invokeGitApplyPatch'
import { createConfirmAction } from '../utils/createConfirmAction'
import { formatGitOutput } from '../utils/formatGitOutput'
import { truncateOutput } from '../utils/truncateOutput'
import { withRepo } from '../utils/withRepo'

interface ApplyPatchArgs {
  patchText?: unknown
  check?: unknown
  threeWay?: unknown
}

/**
 * Factory for `git_apply_patch`. Destructive — modifies the working
 * tree (and the index when the patch touches staged content). Set
 * `check=true` for a dry-run validation pass (no changes applied).
 */
export const createGitApplyPatchTool: GitToolFactory = (opts) => {
  const tool: ToolModule = {
    name: 'git_apply_patch',
    definition: {
      type: 'function',
      function: {
        name: 'git_apply_patch',
        description:
          'Apply a unified-diff patch via `git apply`. Set `check=true` for dry-run validation. Use `threeWay=true` to allow partial application when context lines differ.',
        parameters: {
          type: 'object',
          properties: {
            patchText: { type: 'string', description: 'The patch text to apply (unified diff).' },
            check: { type: 'boolean', description: 'Dry-run validation (no changes applied).' },
            threeWay: { type: 'boolean', description: 'Use --3way for partial-context application.' },
          },
          required: ['patchText'],
        },
      },
    },
    execute: async (args): Promise<ToolResult> =>
      withRepo(opts, async (rootPath) => {
        const a = (args ?? {}) as ApplyPatchArgs
        const patchText = typeof a.patchText === 'string' ? a.patchText : ''
        if (!patchText) return { kind: 'error', message: '`patchText` is required.' }
        const check = a.check === true
        const threeWay = a.threeWay === true
        return {
          kind: 'confirm-required',
          confirmAction: createConfirmAction({
            action: 'git_apply_patch',
            description: check ? 'Validate patch (dry run)' : 'Apply patch to working tree',
            items: [{ path: rootPath, type: 'repo', details: check ? '--check' : 'apply' }],
            warning: check
              ? 'Dry run — no files will be modified.'
              : 'The working tree will be modified. Make sure you have a clean baseline (commit or stash) before applying.',
            severity: check ? 'caution' : 'danger',
          }),
          executeAfterConfirm: async () => {
            const data = await invokeGitApplyPatch({ rootPath, patchText, check, threeWay })
            if (!check) {
              const kinds: GitMutationKind[] = ['workdir', 'index']
              opts.onMutate?.(rootPath, kinds)
            }
            const out = [data.stdout, data.stderr].filter((s) => s && s.trim()).join('\n')
            return truncateOutput(out ? formatGitOutput(out) : check ? 'Patch is valid.' : 'Patch applied.')
          },
        }
      }),
  }
  return tool
}
