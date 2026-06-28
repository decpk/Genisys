import type { GitToolFactory } from '../git.types'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'
import { invokeGitArchive } from '../api/invokeGitArchive'
import { withRepo } from '../utils/withRepo'

interface ArchiveArgs {
  refName?: unknown
  format?: unknown
  outputPath?: unknown
}

/**
 * Factory for `git_archive`. Read-only — creates a tar/zip snapshot
 * of a ref. Without `outputPath` it returns the byte count only
 * (binary stdout isn't JSON-safe); with `outputPath` it writes to
 * disk and returns the path.
 */
export const createGitArchiveTool: GitToolFactory = (opts) => {
  const tool: ToolModule = {
    name: 'git_archive',
    definition: {
      type: 'function',
      function: {
        name: 'git_archive',
        description:
          'Produce a tar/zip snapshot of a ref. Supply `outputPath` to write to disk; otherwise only the byte count is returned. Default format: tar.',
        parameters: {
          type: 'object',
          properties: {
            refName: { type: 'string', description: 'Ref/commit to archive (e.g. HEAD, v1.0.0).' },
            format: { type: 'string', description: 'Archive format: tar | zip. Default tar.' },
            outputPath: { type: 'string', description: 'Optional absolute path to write the archive to.' },
          },
          required: ['refName'],
        },
      },
    },
    execute: async (rawArgs): Promise<ToolResult> =>
      withRepo(opts, async (rootPath) => {
        const a = (rawArgs ?? {}) as ArchiveArgs
        const refName = typeof a.refName === 'string' ? a.refName.trim() : ''
        if (!refName) return { kind: 'error', message: '`refName` is required.' }
        const format = typeof a.format === 'string' && a.format.trim() ? a.format.trim() : undefined
        const outputPath =
          typeof a.outputPath === 'string' && a.outputPath.trim() ? a.outputPath.trim() : undefined
        try {
          const data = await invokeGitArchive({ rootPath, refName, format, outputPath })
          if (data.outputPath) {
            return { kind: 'success', message: `Wrote ${data.format} archive of ${refName} to ${data.outputPath}.` }
          }
          return {
            kind: 'success',
            message: `Built ${data.format} archive of ${refName} (${data.bytes ?? 0} bytes). Pass \`outputPath\` to persist it.`,
          }
        } catch (err) {
          return { kind: 'error', message: err instanceof Error ? err.message : 'git archive failed' }
        }
      }),
  }
  return tool
}
