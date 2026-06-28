import type { GitToolFactory } from '../git.types'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'
import { invokeGitClean } from '../api/invokeGitClean'
import { createConfirmAction } from '../utils/createConfirmAction'
import { formatGitOutput } from '../utils/formatGitOutput'
import { truncateOutput } from '../utils/truncateOutput'
import { withRepo } from '../utils/withRepo'

interface CleanArgs {
  paths?: unknown
  includeIgnored?: unknown
  includeDirectories?: unknown
  dryRun?: unknown
}

function coercePaths(v: unknown): string[] | undefined {
  if (!Array.isArray(v)) return undefined
  const out = v.filter((p): p is string => typeof p === 'string' && p.length > 0)
  return out.length > 0 ? out : undefined
}

export const createGitCleanTool: GitToolFactory = (opts) => {
  const tool: ToolModule = {
    name: 'git_clean',
    definition: {
      type: 'function',
      function: {
        name: 'git_clean',
        description:
          'Remove untracked files from the working tree. ALWAYS run with `dryRun=true` first to see what would be removed. With `dryRun=false`, files are permanently deleted.',
        parameters: {
          type: 'object',
          properties: {
            paths: {
              type: 'array',
              items: { type: 'string' },
              description: 'Optional pathspec list to limit the scope.',
            },
            includeIgnored: {
              type: 'boolean',
              description: 'Also remove `.gitignore`d files. Default false.',
            },
            includeDirectories: {
              type: 'boolean',
              description: 'Recurse into untracked directories. Default false.',
            },
            dryRun: {
              type: 'boolean',
              description: 'If true, just list what would be deleted. Default false.',
            },
          },
        },
      },
    },
    execute: async (args): Promise<ToolResult> =>
      withRepo(opts, async (rootPath) => {
        const a = (args ?? {}) as CleanArgs
        const paths = coercePaths(a.paths)
        const includeIgnored = a.includeIgnored === true
        const includeDirectories = a.includeDirectories === true
        const dryRun = a.dryRun === true

        // Dry-run is read-only — no confirmation.
        if (dryRun) {
          try {
            const stdout = await invokeGitClean({
              rootPath,
              paths,
              includeIgnored,
              includeDirectories,
              dryRun: true,
            })
            return {
              kind: 'success',
              message: truncateOutput(
                `Dry-run — files that would be removed:\n\n${formatGitOutput(stdout) || '(none)'}`
              ),
            }
          } catch (err) {
            return {
              kind: 'error',
              message: err instanceof Error ? err.message : 'git clean --dry-run failed',
            }
          }
        }

        return {
          kind: 'confirm-required',
          confirmAction: createConfirmAction({
            action: 'git_clean',
            description: `Clean untracked${includeIgnored ? ' + ignored' : ''}${includeDirectories ? ' + dirs' : ''}`,
            items: (paths ?? [rootPath]).map((p) => ({ path: p, type: 'untracked' })),
            warning:
              'Untracked files will be PERMANENTLY DELETED. Run with dryRun=true first to preview.',
            severity: 'danger',
          }),
          executeAfterConfirm: async () => {
            const stdout = await invokeGitClean({
              rootPath,
              paths,
              includeIgnored,
              includeDirectories,
              dryRun: false,
            })
            opts.onMutate?.(rootPath, ['workdir'])
            return truncateOutput(`Cleaned.\n\n${formatGitOutput(stdout)}`)
          },
        }
      }),
  }
  return tool
}
