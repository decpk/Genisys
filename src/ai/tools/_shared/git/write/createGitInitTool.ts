import type { GitToolFactory } from '../git.types'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'
import { invokeGitInit } from '../api/invokeGitInit'
import { createConfirmAction } from '../utils/createConfirmAction'
import { formatGitOutput } from '../utils/formatGitOutput'
import { truncateOutput } from '../utils/truncateOutput'

interface InitArgs {
  targetPath?: unknown
  bare?: unknown
  initialBranch?: unknown
}

/**
 * Factory for `git_init`. Operates on a target path (may be outside
 * any currently-open repo), so it bypasses `withRepo`.
 */
export const createGitInitTool: GitToolFactory = () => {
  const tool: ToolModule = {
    name: 'git_init',
    definition: {
      type: 'function',
      function: {
        name: 'git_init',
        description:
          'Initialize a new git repository at `targetPath`. The path is created if missing; refuses if a `.git` directory already exists.',
        parameters: {
          type: 'object',
          properties: {
            targetPath: { type: 'string', description: 'Absolute path to initialize.' },
            bare: { type: 'boolean', description: 'Create a bare repository (no working tree).' },
            initialBranch: { type: 'string', description: 'Override the initial branch name (e.g. "main").' },
          },
          required: ['targetPath'],
        },
      },
    },
    execute: async (rawArgs): Promise<ToolResult> => {
      const a = (rawArgs ?? {}) as InitArgs
      const targetPath = typeof a.targetPath === 'string' ? a.targetPath.trim() : ''
      if (!targetPath) return { kind: 'error', message: '`targetPath` is required.' }
      const bare = a.bare === true
      const initialBranch =
        typeof a.initialBranch === 'string' && a.initialBranch.trim()
          ? a.initialBranch.trim()
          : undefined
      return {
        kind: 'confirm-required',
        confirmAction: createConfirmAction({
          action: 'git_init',
          description: `Initialize ${bare ? 'bare ' : ''}repo at ${targetPath}${initialBranch ? ` (branch ${initialBranch})` : ''}`,
          items: [{ path: targetPath, type: 'repo', details: bare ? 'bare' : 'workdir' }],
          warning: 'Creates a new .git directory at the target path.',
          severity: 'caution',
        }),
        executeAfterConfirm: async () => {
          const data = await invokeGitInit({ targetPath, bare, initialBranch })
          return truncateOutput(`Initialized repo at ${data.targetPath}.\n\n${formatGitOutput(data.stdout)}`)
        },
      }
    },
  }
  return tool
}
