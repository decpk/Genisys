import type { ToolResult } from '@/ai/tools/tools.types'
import { invokeIsLocalGitRepo } from '../api/invokeIsLocalGitRepo'
import type { GitToolFactoryOpts } from '../git.types'

/**
 * Pre-flight wrapper used by every git tool. Resolves the repo root via
 * the host's `getRootPath` callback, verifies it is a git working tree,
 * then hands the resolved path to `run`. Centralizes the two failure
 * modes (no folder open / not a git repo) so individual tools never
 * duplicate the boilerplate.
 *
 * Returning a ToolResult lets us short-circuit cleanly without throwing.
 */
export async function withRepo(
  opts: GitToolFactoryOpts,
  run: (rootPath: string) => Promise<ToolResult>,
): Promise<ToolResult> {
  const rootPath = opts.getRootPath()
  if (!rootPath) {
    return {
      kind: 'error',
      message: 'No folder is open. Open a folder first so I know which repo to operate on.',
    }
  }
  let isRepo: boolean
  try {
    isRepo = await invokeIsLocalGitRepo(rootPath)
  } catch {
    isRepo = false
  }
  if (!isRepo) {
    return {
      kind: 'error',
      message: `\`${rootPath}\` is not a git repository. Initialize it with \`git init\` first.`,
    }
  }
  return run(rootPath)
}
