import type { GitToolFactory, GitMutationKind } from '../git.types'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'
import { invokeGitBisect, type GitBisectOp } from '../api/invokeGitBisect'
import { createConfirmAction } from '../utils/createConfirmAction'
import { formatConflictAwareResult } from '../utils/formatConflictAwareResult'
import { truncateOutput } from '../utils/truncateOutput'
import { withRepo } from '../utils/withRepo'

interface BisectArgs {
  op?: unknown
  args?: unknown
}

const ALLOWED_OPS: readonly GitBisectOp[] = ['start', 'good', 'bad', 'skip', 'reset'] as const

function isBisectOp(v: unknown): v is GitBisectOp {
  return typeof v === 'string' && (ALLOWED_OPS as readonly string[]).includes(v)
}

/**
 * Factory for `git_bisect`. Op-routed so a single tool covers the
 * five sub-commands (`start`, `good`, `bad`, `skip`, `reset`) — keeps
 * the LLM's tool inventory compact for a rarely-used flow.
 */
export const createGitBisectTool: GitToolFactory = (opts) => {
  const tool: ToolModule = {
    name: 'git_bisect',
    definition: {
      type: 'function',
      function: {
        name: 'git_bisect',
        description:
          'Run a `git bisect` sub-command. Use `start` (with optional bad/good refs in args), then `good`/`bad`/`skip` for each checkout, then `reset` to finish. HEAD will be moved repeatedly during the search.',
        parameters: {
          type: 'object',
          properties: {
            op: {
              type: 'string',
              enum: ['start', 'good', 'bad', 'skip', 'reset'],
              description: 'Bisect sub-command.',
            },
            args: {
              type: 'array',
              items: { type: 'string' },
              description:
                'Extra args. For `start`, optionally [badRef, goodRef]. For `good`/`bad`/`skip`, optionally a commit ref (defaults to HEAD).',
            },
          },
          required: ['op'],
        },
      },
    },
    execute: async (rawArgs): Promise<ToolResult> =>
      withRepo(opts, async (rootPath) => {
        const a = (rawArgs ?? {}) as BisectArgs
        if (!isBisectOp(a.op)) {
          return {
            kind: 'error',
            message: `\`op\` must be one of: ${ALLOWED_OPS.join(', ')}.`,
          }
        }
        const op = a.op
        const extra = Array.isArray(a.args)
          ? a.args.filter((s): s is string => typeof s === 'string' && s.trim().length > 0)
          : []
        const mutations: GitMutationKind[] =
          op === 'reset' ? ['head'] : ['head', 'workdir', 'index']
        const detail = extra.length > 0 ? `${op} ${extra.join(' ')}` : op
        return {
          kind: 'confirm-required',
          confirmAction: createConfirmAction({
            action: 'git_bisect',
            description: `git bisect ${detail}`,
            items: [{ path: rootPath, type: 'repo', details: detail }],
            warning:
              op === 'reset'
                ? 'Ends the bisect session and restores HEAD to the original branch.'
                : 'HEAD will be moved to a different commit during the bisect search.',
            severity: 'caution',
          }),
          executeAfterConfirm: async () => {
            const result = await invokeGitBisect({ rootPath, op, args: extra })
            opts.onMutate?.(rootPath, mutations)
            return truncateOutput(
              formatConflictAwareResult(
                `git bisect ${detail} succeeded.`,
                'Bisect operation reported a conflict — inspect via git_status.',
                result,
              ),
            )
          },
        }
      }),
  }
  return tool
}
