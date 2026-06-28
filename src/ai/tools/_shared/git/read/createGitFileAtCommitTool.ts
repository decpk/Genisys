import type { GitToolFactory } from '../git.types'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'
import { invokeGitFileAtCommit } from '../api/invokeGitFileAtCommit'
import { truncateOutput } from '../utils/truncateOutput'
import { withRepo } from '../utils/withRepo'

interface FileAtCommitArgs {
  filePath?: unknown
  commitHash?: unknown
}

/**
 * Factory for the `git_file_at_commit` tool. Reads the historical
 * contents of a file at a specific commit / ref. Useful for diffing,
 * recovering deleted files, or grounding reviews on past versions.
 */
export const createGitFileAtCommitTool: GitToolFactory = (opts) => {
  const tool: ToolModule = {
    name: 'git_file_at_commit',
    definition: {
      type: 'function',
      function: {
        name: 'git_file_at_commit',
        description:
          'Read the contents of a file as it existed at a specific commit or ref. Returns an empty string when the file did not exist at that revision.',
        parameters: {
          type: 'object',
          properties: {
            filePath: {
              type: 'string',
              description: 'Repository-relative path to the file (e.g. "src/App.tsx").',
            },
            commitHash: {
              type: 'string',
              description: 'Commit SHA, branch name, tag, or any ref expression (e.g. "HEAD~3", "main").',
            },
          },
          required: ['filePath', 'commitHash'],
        },
      },
    },
    execute: async (args: unknown): Promise<ToolResult> =>
      withRepo(opts, async (rootPath) => {
        const a = (args ?? {}) as FileAtCommitArgs
        const filePath = typeof a.filePath === 'string' ? a.filePath : ''
        const commitHash = typeof a.commitHash === 'string' ? a.commitHash : ''
        if (!filePath) return { kind: 'error', message: '`filePath` is required.' }
        if (!commitHash) return { kind: 'error', message: '`commitHash` is required.' }
        try {
          const data = await invokeGitFileAtCommit({ rootPath, filePath, commitHash })
          if (!data) {
            return {
              kind: 'success',
              message: `(file "${filePath}" did not exist at ${commitHash})`,
            }
          }
          return { kind: 'success', message: truncateOutput(data) }
        } catch (err) {
          return {
            kind: 'error',
            message: err instanceof Error ? err.message : 'git file-at-commit failed',
          }
        }
      }),
  }
  return tool
}
