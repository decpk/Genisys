import type { GitToolFactory } from '../git.types'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'
import { invokeGitConfigSet } from '../api/invokeGitConfigSet'
import type { GitConfigScope } from '../api/invokeGitConfigGet'
import { createConfirmAction } from '../utils/createConfirmAction'
import { formatGitOutput } from '../utils/formatGitOutput'
import { truncateOutput } from '../utils/truncateOutput'
import { withRepo } from '../utils/withRepo'

interface ConfigSetArgs {
  key?: unknown
  value?: unknown
  scope?: unknown
}

const VALID_SCOPES: readonly GitConfigScope[] = ['local', 'global', 'system'] as const

function coerceScope(v: unknown): GitConfigScope | undefined {
  if (typeof v !== 'string') return undefined
  return (VALID_SCOPES as readonly string[]).includes(v) ? (v as GitConfigScope) : undefined
}

/**
 * Factory for `git_config_set`. Writes a config entry at the
 * requested scope (default local).
 */
export const createGitConfigSetTool: GitToolFactory = (opts) => {
  const tool: ToolModule = {
    name: 'git_config_set',
    definition: {
      type: 'function',
      function: {
        name: 'git_config_set',
        description:
          'Write a git config value. Scope: local (default), global, system. Use sparingly — system scope affects all repos on the machine.',
        parameters: {
          type: 'object',
          properties: {
            key: { type: 'string', description: 'Config key (e.g. "user.email").' },
            value: { type: 'string', description: 'Value to set.' },
            scope: { type: 'string', enum: ['local', 'global', 'system'], description: 'Config scope. Default local.' },
          },
          required: ['key', 'value'],
        },
      },
    },
    execute: async (args): Promise<ToolResult> =>
      withRepo(opts, async (rootPath) => {
        const a = (args ?? {}) as ConfigSetArgs
        const key = typeof a.key === 'string' ? a.key.trim() : ''
        if (!key) return { kind: 'error', message: '`key` is required.' }
        if (typeof a.value !== 'string') return { kind: 'error', message: '`value` is required.' }
        const value = a.value
        const scope = coerceScope(a.scope) ?? 'local'
        return {
          kind: 'confirm-required',
          confirmAction: createConfirmAction({
            action: 'git_config_set',
            description: `Set ${scope} config: ${key}=${value}`,
            items: [{ path: key, type: 'config', details: `${scope}: ${value}` }],
            warning:
              scope === 'system'
                ? 'System scope — affects every repo on this machine.'
                : scope === 'global'
                  ? 'Global scope — affects every repo for this user.'
                  : 'Local scope — only this repo.',
            severity: scope === 'local' ? 'caution' : 'danger',
          }),
          executeAfterConfirm: async () => {
            const stdout = await invokeGitConfigSet({ rootPath, key, value, scope })
            opts.onMutate?.(rootPath, ['config'])
            return truncateOutput(stdout.trim() ? formatGitOutput(stdout) : `Set ${scope}.${key}=${value}.`)
          },
        }
      }),
  }
  return tool
}
