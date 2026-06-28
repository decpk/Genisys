import type { GitToolFactory } from '../git.types'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'
import { invokeGitCommitContext } from '../api/invokeGitCommitContext'
import { truncateOutput } from '../utils/truncateOutput'
import { withRepo } from '../utils/withRepo'

const DEFAULT_DIFF_CHARS = 8_000
const HARD_DIFF_CHARS = 30_000
const DEFAULT_RECENT_MESSAGES = 10
const HARD_RECENT_MESSAGES = 30

/**
 * Factory for the `git_get_commit_context` tool. Bundles the staged
 * diff and recent commit subjects in a single call so the LLM can draft
 * a commit message without chaining `git_diff` + `git_log` calls.
 */
export const createGitGetCommitContextTool: GitToolFactory = (opts) => {
  const tool: ToolModule = {
    name: 'git_get_commit_context',
    definition: {
      type: 'function',
      function: {
        name: 'git_get_commit_context',
        description:
          'Bundle the staged diff and recent commit subjects so a commit message can be drafted. Use this before calling `git_commit` when you need context.',
        parameters: {
          type: 'object',
          properties: {
            maxDiffChars: {
              type: 'number',
              description: `Soft cap on the staged-diff body. Default ${DEFAULT_DIFF_CHARS}, max ${HARD_DIFF_CHARS}.`,
            },
            recentMessages: {
              type: 'number',
              description: `How many recent commit subjects to include. Default ${DEFAULT_RECENT_MESSAGES}, max ${HARD_RECENT_MESSAGES}.`,
            },
          },
        },
      },
    },
    execute: async (args): Promise<ToolResult> =>
      withRepo(opts, async (rootPath) => {
        const maxDiffChars = clamp(
          typeof args.maxDiffChars === 'number' ? args.maxDiffChars : DEFAULT_DIFF_CHARS,
          1,
          HARD_DIFF_CHARS,
        )
        const recentMessages = clamp(
          typeof args.recentMessages === 'number' ? args.recentMessages : DEFAULT_RECENT_MESSAGES,
          0,
          HARD_RECENT_MESSAGES,
        )
        try {
          const data = await invokeGitCommitContext({ rootPath, maxDiffChars, recentMessages })
          const truncatedNote = data.truncated ? ' _(diff was truncated)_' : ''
          const recentSection = data.recentMessages.length === 0
            ? '_No recent commits._'
            : data.recentMessages.map((m) => `- ${m}`).join('\n')
          const body = [
            `## Staged diff${truncatedNote}`,
            '',
            '```diff',
            data.diff.length === 0 ? '(no staged changes)' : data.diff,
            '```',
            '',
            `## Recent commits (${data.recentMessages.length})`,
            recentSection,
          ].join('\n')
          return { kind: 'success', message: truncateOutput(body) }
        } catch (err) {
          return {
            kind: 'error',
            message: err instanceof Error ? err.message : 'git commit context failed',
          }
        }
      }),
  }
  return tool
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.floor(value)))
}
