import type { GitToolFactory } from '../git.types'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'
import { invokeGitFetch } from '../api/invokeGitFetch'
import { truncateOutput } from '../utils/truncateOutput'
import { withRepo } from '../utils/withRepo'

/**
 * Factory for the `git_fetch` tool. Refreshes remote refs only — no
 * working-tree changes — so this does not require confirmation.
 */
export const createGitFetchTool: GitToolFactory = (opts) => {
  const tool: ToolModule = {
    name: 'git_fetch',
    definition: {
      type: 'function',
      function: {
        name: 'git_fetch',
        description:
          'Run `git fetch --all --prune` to refresh remote refs. Read-only against the working tree — does not require confirmation.',
        parameters: { type: 'object', properties: {} },
      },
    },
    execute: async (): Promise<ToolResult> =>
      withRepo(opts, async (rootPath) => {
        try {
          const out = await invokeGitFetch(rootPath)
          opts.onMutate?.(rootPath, ['refs'])
          const stdout = out.stdout.trim()
          const body = stdout.length === 0
            ? '_(remote already up to date)_'
            : `\`\`\`\n${stdout}\n\`\`\``
          return { kind: 'success', message: truncateOutput(`✅ Fetched.\n\n${body}`) }
        } catch (err) {
          return {
            kind: 'error',
            message: err instanceof Error ? err.message : 'git fetch failed',
          }
        }
      }),
  }
  return tool
}
