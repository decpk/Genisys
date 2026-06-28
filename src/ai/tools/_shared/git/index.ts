/**
 * Cross-assistant git tool barrel.
 *
 * Hosts call `createGitToolModules({ getRootPath, onMutate? })` to
 * obtain the full set of `ToolModule` instances ready to be merged
 * into the host's tool registry. The factory pattern keeps every tool
 * stateless and lets each host inject its own root-path resolver
 * (e.g. CodeReview's context folder vs Project Explorer's repo list)
 * without leaking host concepts into `_shared/`.
 *
 * Per `.claude.md` (Folder Structure & Reusability) — this barrel is
 * wiring-only: no logic. Individual factories live one-per-file under
 * `read/` and `write/`.
 */

import type { ToolModule } from '@/ai/tools/tools.types'
import type { GitToolFactoryOpts } from './git.types'

import { createGitStatusTool } from './read/createGitStatusTool'
import { createGitLogTool } from './read/createGitLogTool'
import { createGitBranchTool } from './read/createGitBranchTool'
import { createGitListBranchesTool } from './read/createGitListBranchesTool'
import { createGitDiffTool } from './read/createGitDiffTool'
import { createGitBlameTool } from './read/createGitBlameTool'
import { createGitFileHistoryTool } from './read/createGitFileHistoryTool'
import { createGitRemoteUrlTool } from './read/createGitRemoteUrlTool'
import { createGitGetCommitContextTool } from './read/createGitGetCommitContextTool'
import { createGitOperationStateTool } from './read/createGitOperationStateTool'
import { createGitWorktreesTool } from './read/createGitWorktreesTool'
import { createGitFileAtCommitTool } from './read/createGitFileAtCommitTool'
import { createGitStashListTool } from './read/createGitStashListTool'
import { createGitStashShowTool } from './read/createGitStashShowTool'
import { createGitReflogTool } from './read/createGitReflogTool'
import { createGitTagListTool } from './read/createGitTagListTool'
import { createGitRemoteListTool } from './read/createGitRemoteListTool'
import { createGitSubmoduleStatusTool } from './read/createGitSubmoduleStatusTool'
import { createGitFormatPatchTool } from './read/createGitFormatPatchTool'
import { createGitArchiveTool } from './read/createGitArchiveTool'
import { createGitNotesShowTool } from './read/createGitNotesShowTool'
import { createGitDescribeTool } from './read/createGitDescribeTool'
import { createGitShowTool } from './read/createGitShowTool'
import { createGitLsFilesTool } from './read/createGitLsFilesTool'
import { createGitLsTreeTool } from './read/createGitLsTreeTool'
import { createGitGrepTool } from './read/createGitGrepTool'
import { createGitConfigGetTool } from './read/createGitConfigGetTool'

import { createGitStageFilesTool } from './write/createGitStageFilesTool'
import { createGitUnstageFilesTool } from './write/createGitUnstageFilesTool'
import { createGitFetchTool } from './write/createGitFetchTool'
import { createGitDiscardChangesTool } from './write/createGitDiscardChangesTool'
import { createGitCommitTool } from './write/createGitCommitTool'
import { createGitPullTool } from './write/createGitPullTool'
import { createGitPushTool } from './write/createGitPushTool'
import { createGitCheckoutBranchTool } from './write/createGitCheckoutBranchTool'
import { createGitStashSaveTool } from './write/createGitStashSaveTool'
import { createGitStashPopTool } from './write/createGitStashPopTool'
import { createGitStashApplyTool } from './write/createGitStashApplyTool'
import { createGitStashDropTool } from './write/createGitStashDropTool'
import { createGitBranchCreateTool } from './write/createGitBranchCreateTool'
import { createGitBranchDeleteTool } from './write/createGitBranchDeleteTool'
import { createGitBranchRenameTool } from './write/createGitBranchRenameTool'
import { createGitCommitAmendTool } from './write/createGitCommitAmendTool'
import { createGitResetTool } from './write/createGitResetTool'
import { createGitRevertTool } from './write/createGitRevertTool'
import { createGitCleanTool } from './write/createGitCleanTool'
import { createGitRestoreTool } from './write/createGitRestoreTool'
import { createGitMergeTool } from './write/createGitMergeTool'
import { createGitMergeAbortTool } from './write/createGitMergeAbortTool'
import { createGitMergeContinueTool } from './write/createGitMergeContinueTool'
import { createGitRebaseTool } from './write/createGitRebaseTool'
import { createGitRebaseContinueTool } from './write/createGitRebaseContinueTool'
import { createGitRebaseAbortTool } from './write/createGitRebaseAbortTool'
import { createGitRebaseSkipTool } from './write/createGitRebaseSkipTool'
import { createGitCherryPickTool } from './write/createGitCherryPickTool'
import { createGitCherryPickContinueTool } from './write/createGitCherryPickContinueTool'
import { createGitCherryPickAbortTool } from './write/createGitCherryPickAbortTool'
import { createGitBisectTool } from './write/createGitBisectTool'
import { createGitTagCreateTool } from './write/createGitTagCreateTool'
import { createGitTagDeleteTool } from './write/createGitTagDeleteTool'
import { createGitTagPushTool } from './write/createGitTagPushTool'
import { createGitRemoteAddTool } from './write/createGitRemoteAddTool'
import { createGitRemoteRemoveTool } from './write/createGitRemoteRemoveTool'
import { createGitRemoteSetUrlTool } from './write/createGitRemoteSetUrlTool'
import { createGitSubmoduleUpdateTool } from './write/createGitSubmoduleUpdateTool'
import { createGitSubmoduleAddTool } from './write/createGitSubmoduleAddTool'
import { createGitSubmoduleSyncTool } from './write/createGitSubmoduleSyncTool'
import { createGitWorktreeAddTool } from './write/createGitWorktreeAddTool'
import { createGitWorktreeRemoveTool } from './write/createGitWorktreeRemoveTool'
import { createGitWorktreePruneTool } from './write/createGitWorktreePruneTool'
import { createGitApplyPatchTool } from './write/createGitApplyPatchTool'
import { createGitAmTool } from './write/createGitAmTool'
import { createGitNotesAddTool } from './write/createGitNotesAddTool'
import { createGitNotesRemoveTool } from './write/createGitNotesRemoveTool'
import { createGitConfigSetTool } from './write/createGitConfigSetTool'
import { createGitCloneTool } from './write/createGitCloneTool'
import { createGitInitTool } from './write/createGitInitTool'

/**
 * Build the complete set of git tool modules for one host.
 * Order: read tools first (alphabetical-ish by area), then write tools
 * grouped by area (staging → remote sync → workdir → commits → branches
 * → stash → reset/revert/restore/clean).
 */
export function createGitToolModules(opts: GitToolFactoryOpts): ToolModule[] {
  return [
    // ── Read ─────────────────────────────────────────────────
    createGitStatusTool(opts),
    createGitLogTool(opts),
    createGitBranchTool(opts),
    createGitListBranchesTool(opts),
    createGitDiffTool(opts),
    createGitBlameTool(opts),
    createGitFileHistoryTool(opts),
    createGitRemoteUrlTool(opts),
    createGitGetCommitContextTool(opts),
    createGitOperationStateTool(opts),
    createGitWorktreesTool(opts),
    createGitFileAtCommitTool(opts),
    createGitStashListTool(opts),
    createGitStashShowTool(opts),
    createGitReflogTool(opts),
    createGitTagListTool(opts),
    createGitRemoteListTool(opts),
    createGitSubmoduleStatusTool(opts),
    // ── Read — patches / inspection / config ─────────────────
    createGitFormatPatchTool(opts),
    createGitArchiveTool(opts),
    createGitNotesShowTool(opts),
    createGitDescribeTool(opts),
    createGitShowTool(opts),
    createGitLsFilesTool(opts),
    createGitLsTreeTool(opts),
    createGitGrepTool(opts),
    createGitConfigGetTool(opts),
    // ── Write — staging ──────────────────────────────────────
    createGitStageFilesTool(opts),
    createGitUnstageFilesTool(opts),
    // ── Write — remote sync ──────────────────────────────────
    createGitFetchTool(opts),
    createGitPullTool(opts),
    createGitPushTool(opts),
    // ── Write — workdir / discard ────────────────────────────
    createGitDiscardChangesTool(opts),
    createGitRestoreTool(opts),
    createGitCleanTool(opts),
    // ── Write — commits ──────────────────────────────────────
    createGitCommitTool(opts),
    createGitCommitAmendTool(opts),
    createGitResetTool(opts),
    createGitRevertTool(opts),
    // ── Write — branches ─────────────────────────────────────
    createGitCheckoutBranchTool(opts),
    createGitBranchCreateTool(opts),
    createGitBranchDeleteTool(opts),
    createGitBranchRenameTool(opts),
    // ── Write — stash ────────────────────────────────────────
    createGitStashSaveTool(opts),
    createGitStashPopTool(opts),
    createGitStashApplyTool(opts),
    createGitStashDropTool(opts),
    // ── Write — merge / rebase / cherry-pick / bisect ────────
    createGitMergeTool(opts),
    createGitMergeContinueTool(opts),
    createGitMergeAbortTool(opts),
    createGitRebaseTool(opts),
    createGitRebaseContinueTool(opts),
    createGitRebaseSkipTool(opts),
    createGitRebaseAbortTool(opts),
    createGitCherryPickTool(opts),
    createGitCherryPickContinueTool(opts),
    createGitCherryPickAbortTool(opts),
    createGitBisectTool(opts),
    // ── Write — tags ─────────────────────────────────────────
    createGitTagCreateTool(opts),
    createGitTagDeleteTool(opts),
    createGitTagPushTool(opts),
    // ── Write — remotes ──────────────────────────────────────
    createGitRemoteAddTool(opts),
    createGitRemoteRemoveTool(opts),
    createGitRemoteSetUrlTool(opts),
    // ── Write — submodules ───────────────────────────────────
    createGitSubmoduleUpdateTool(opts),
    createGitSubmoduleAddTool(opts),
    createGitSubmoduleSyncTool(opts),
    // ── Write — worktrees ────────────────────────────────────
    createGitWorktreeAddTool(opts),
    createGitWorktreeRemoveTool(opts),
    createGitWorktreePruneTool(opts),
    // ── Write — patches ──────────────────────────────────────
    createGitApplyPatchTool(opts),
    createGitAmTool(opts),
    // ── Write — notes ────────────────────────────────────────
    createGitNotesAddTool(opts),
    createGitNotesRemoveTool(opts),
    // ── Write — config ───────────────────────────────────────
    createGitConfigSetTool(opts),
    // ── Write — clone / init (target outside current repo) ───
    createGitCloneTool(opts),
    createGitInitTool(opts),
  ]
}

export type {
  GitMutationKind,
  GitToolFactory,
  GitToolFactoryOpts,
} from './git.types'
