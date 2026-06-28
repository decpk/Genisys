import type { GitToolFactory } from '../git.types'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'
import { invokeGitConfigGet } from '../api/invokeGitConfigGet'
import type { GitConfigScope } from '../api/invokeGitConfigGet'
import { withRepo } from '../utils/withRepo'

interface ConfigGetArgs {
  key?: unknown
  scope?: unknown
}

const VALID_SCOPES: readonly GitConfigScope[] = ['local', 'global', 'system'] as const

function coerceScope(v: unknown): GitConfigScope | undefined {
  if (typeof v !== 'string') return undefined
  return (VALID_SCOPES as readonly string[]).includes(v) ? (v as GitConfigScope) : undefined
}

/**
 * Factory for `git_config_get`. Read-only — fetch a config value
 * from the requested scope (default local).
 */
export const createGitConfigGetTool: GitToolFactory = (opts) => {
  const tool: ToolModule = {
    name: 'git_config_get',
    definition: {
      type: 'function',
      function: {
        name: 'git_config_get',
        description: 'Read a git config value. Scope: local (default), global, or system.',
        parameters: {
          type: 'object',
          properties: {
            key: { type: 'string', description: 'Config key (e.g. "user.email", "remote.origin.url").' },
            scope: { type: 'string', enum: ['local', 'global', 'system'], description: 'Config scope. Default local.' },
          },
          required: ['key'],
        },
      },
    },
    execute: async (rawArgs): Promise<ToolResult> =>
      withRepo(opts, async (rootPath) => {
        const a = (rawArgs ?? {}) as ConfigGetArgs
        const key = typeof a.key === 'string' ? a.key.trim() : ''
        if (!key) return { kind: 'error', message: '`key` is required.' }
        const scope = coerceScope(a.scope)
        try {
          const stdout = await invokeGitConfigGet({ rootPath, key, scope })
          return { kind: 'success', message: stdout.trim() || '(unset)' }
        } catch (err) {
          return { kind: 'error', message: err instanceof Error ? err.message : 'git config get failed' }
        }
      }),
  }
  return tool
}
