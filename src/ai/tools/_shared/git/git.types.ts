/**
 * Shared types for the cross-assistant git tool factories.
 *
 * Pure declarations only — no constants, no functions. Per
 * `.claude.md` (Types Files Are Declaration-Only).
 */

import type { ToolModule } from '@/ai/tools/tools.types'

/** Per-host options injected at registration time. */
export interface GitToolFactoryOpts {
  /**
   * Resolves the repo's working-tree root. Returning `null` causes every
   * tool to short-circuit with a "no folder open" error so the LLM is
   * told to pick/open a folder first.
   */
  getRootPath: () => string | null
  /**
   * Optional callback invoked after a successful mutating git operation
   * so host UIs (e.g. CodeGitPanel) can refresh immediately rather than
   * waiting for the FS watcher debounce. Hosts wire this to their own
   * git event bus; if omitted, callers rely on the watcher.
   */
  onMutate?: (rootPath: string, kinds: GitMutationKind[]) => void
}

/**
 * Categorical hint about *what* a mutation touched. Mirrors the
 * `CodeGitEventKind` enum used by the CodeGitPanel's event bus so a
 * host adapter can forward without remapping.
 *
 * - `index` — staging area changed
 * - `workdir` — working tree changed
 * - `head` — HEAD moved (commit, reset, checkout)
 * - `refs` — branch refs changed (create/delete/rename)
 * - `merge` — merge / rebase / cherry-pick state changed
 * - `stash` — stash list changed
 * - `tags` — tag refs changed
 * - `remotes` — remote configuration changed
 * - `worktrees` — linked worktree list changed
 * - `submodules` — submodule registration / commit changed
 * - `config` — git config (local) changed
 */
export type GitMutationKind =
  | 'index'
  | 'workdir'
  | 'head'
  | 'refs'
  | 'merge'
  | 'stash'
  | 'tags'
  | 'remotes'
  | 'worktrees'
  | 'submodules'
  | 'config'

/** Factory shape every per-tool file default-exports. */
export type GitToolFactory = (opts: GitToolFactoryOpts) => ToolModule

/** Wire-shape from the `cmd_git_snapshot` Tauri command. */
export interface GitSnapshotFile {
  path: string
  xy: string
  oldPath?: string | null
}

export interface GitSnapshotData {
  gitRoot: string
  branch: string
  detached: boolean
  upstream: string | null
  ahead: number
  behind: number
  oid: string | null
  hasUpstream: boolean
  merge: GitSnapshotFile[]
  staged: GitSnapshotFile[]
  unstaged: GitSnapshotFile[]
  untracked: GitSnapshotFile[]
}

/** Wire-shape from the `cmd_get_git_log` Tauri command. */
export interface GitLogEntry {
  hash: string
  authorName: string
  authorEmail: string
  date: string
  message: string
  refs: string
}

/** Wire-shape from the `cmd_get_git_branch` Tauri command. */
export interface GitBranchInfo {
  /** Branch name when on a branch, or short SHA when detached. */
  branch: string
  detached: boolean
}

/** Wire-shape entries returned by `cmd_git_get_branches`. */
export interface GitLocalBranch {
  name: string
  upstream: string | null
  isCurrent: boolean
}

export interface GitRemoteBranch {
  name: string
}

export interface GitBranchesData {
  local: GitLocalBranch[]
  remote: GitRemoteBranch[]
}

/** Wire-shape from `cmd_git_get_diff`. */
export interface GitDiffData {
  original: string
  modified: string
  language: string
}

/** Side selector for `git_diff`. */
export type GitDiffSide = 'working' | 'staged' | 'head'

/** Wire-shape from `cmd_git_blame`. */
export interface GitBlameLine {
  line: number
  sha: string
}

export interface GitBlameCommit {
  sha: string
  shortSha: string
  author: string
  authorEmail: string
  /** Unix seconds since epoch. */
  authorTimeUnix: number
  summary: string
  prNumber?: number
}

export interface GitBlameData {
  lines: GitBlameLine[]
  commits: Record<string, GitBlameCommit>
}

/** Wire-shape entries returned by `cmd_get_local_file_git_history`. */
export interface GitFileHistoryEntry {
  hash: string
  authorName: string
  authorEmail: string
  date: string
  message: string
}

/** Wire-shape from `cmd_git_get_commit_context`. */
export interface GitCommitContextData {
  diff: string
  truncated: boolean
  recentMessages: string[]
}

/** Standard Tauri response envelope. */
export interface GitInvokeResponse<T> {
  success?: boolean
  data?: T
  error?: string
}

/**
 * Conflict-aware result returned by `merge` / `rebase` / `cherry-pick`
 * / `revert` family commands. When git exits non-zero with a conflict
 * marker, the backend returns `status: 'conflict'` instead of
 * bubbling an error so the AI can call `git_operation_state` and
 * choose the right `*_continue` / `*_abort` tool.
 */
export interface GitConflictAwareResult {
  status: 'ok' | 'conflict'
  stdout: string
  stderr: string
}
