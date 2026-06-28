import type { GitToolFactory } from '../git.types'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'
import { invokeGitDescribe } from '../api/invokeGitDescribe'
import { withRepo } from '../utils/withRepo'

interface DescribeArgs {
  refName?: unknown
  dirty?: unknown
  abbrev?: unknown
}

/**
 * Factory for `git_describe`. Read-only — produces a
 * human-readable name for a commit using nearest tags
 * (`--tags` is always applied to include lightweight tags).
 */
export const createGitDescribeTool: GitToolFactory = (opts) => {
  const tool: ToolModule = {
    name: 'git_describe',
    definition: {
      type: 'function',
      function: {
        name: 'git_describe',
        description:
          'Produce a human-readable name for a commit using nearby tags (e.g. "v1.2.0-3-gabc123"). Set `dirty=true` to append "-dirty" when the working tree has changes.',
        parameters: {
          type: 'object',
          properties: {
            refName: { type: 'string', description: 'Commit/ref to describe (default HEAD).' },
            dirty: { type: 'boolean', description: 'Append "-dirty" suffix if workdir is dirty (default HEAD only).' },
            abbrev: { type: 'number', description: 'Override the abbreviated SHA length.' },
          },
        },
      },
    },
    execute: async (rawArgs): Promise<ToolResult> =>
      withRepo(opts, async (rootPath) => {
        const a = (rawArgs ?? {}) as DescribeArgs
        const refName = typeof a.refName === 'string' && a.refName.trim() ? a.refName.trim() : undefined
        const dirty = a.dirty === true
        const abbrev =
          typeof a.abbrev === 'number' && Number.isFinite(a.abbrev) && a.abbrev >= 0
            ? Math.floor(a.abbrev)
            : undefined
        try {
          const stdout = await invokeGitDescribe({ rootPath, refName, dirty, abbrev })
          return { kind: 'success', message: stdout.trim() || '(no description)' }
        } catch (err) {
          return { kind: 'error', message: err instanceof Error ? err.message : 'git describe failed' }
        }
      }),
  }
  return tool
}
