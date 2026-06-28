import type { GitToolFactory } from '../git.types'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'
import { invokeGitBlame } from '../api/invokeGitBlame'
import { formatBlameOutput } from '../utils/formatBlameOutput'
import { truncateOutput } from '../utils/truncateOutput'
import { withRepo } from '../utils/withRepo'

const MAX_LINE_RANGE = 500

/**
 * Factory for the `git_blame` tool. Returns per-line blame metadata
 * for a contiguous range, plus a deduplicated commit map (with parsed
 * PR / work-item references when present).
 */
export const createGitBlameTool: GitToolFactory = (opts) => {
  const tool: ToolModule = {
    name: 'git_blame',
    definition: {
      type: 'function',
      function: {
        name: 'git_blame',
        description:
          'Return git blame metadata for a contiguous line range of one file. Each line points at a deduplicated commit (with author, date, summary, and any PR / work-item refs).',
        parameters: {
          type: 'object',
          properties: {
            filePath: {
              type: 'string',
              description: 'Repository-relative file path (e.g. `src/foo/bar.ts`).',
            },
            startLine: {
              type: 'number',
              description: '1-based inclusive start line.',
            },
            endLine: {
              type: 'number',
              description: `1-based inclusive end line. Range is capped at ${MAX_LINE_RANGE} lines.`,
            },
          },
          required: ['filePath', 'startLine', 'endLine'],
        },
      },
    },
    execute: async (args): Promise<ToolResult> =>
      withRepo(opts, async (rootPath) => {
        const filePath = typeof args.filePath === 'string' ? args.filePath.trim() : ''
        if (!filePath) return { kind: 'error', message: '`filePath` is required.' }
        const startLine = typeof args.startLine === 'number' ? Math.max(1, Math.floor(args.startLine)) : 0
        const endLine = typeof args.endLine === 'number' ? Math.max(startLine, Math.floor(args.endLine)) : 0
        if (!startLine || !endLine) {
          return { kind: 'error', message: '`startLine` and `endLine` (1-based) are required.' }
        }
        const cappedEnd = Math.min(endLine, startLine + MAX_LINE_RANGE - 1)
        try {
          const data = await invokeGitBlame({
            rootPath,
            filePath,
            startLine,
            endLine: cappedEnd,
          })
          return {
            kind: 'success',
            message: truncateOutput(formatBlameOutput(filePath, startLine, cappedEnd, data)),
          }
        } catch (err) {
          return { kind: 'error', message: err instanceof Error ? err.message : 'git blame failed' }
        }
      }),
  }
  return tool
}
