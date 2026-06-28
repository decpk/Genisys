import { invokeGitSnapshot } from '../api/invokeGitSnapshot'

/**
 * Throws when the repo at `rootPath` has uncommitted changes (any
 * working-tree or staged entry). Use to guard ops like `checkout`,
 * `rebase`, `merge`, `clean` that would otherwise clobber work.
 *
 * The error message is intentionally short and actionable so the LLM
 * can surface it verbatim to the user.
 */
export async function requireCleanTree(rootPath: string, operation: string): Promise<void> {
  const snap = await invokeGitSnapshot(rootPath)
  const dirty =
    (snap.unstaged?.length ?? 0) > 0 ||
    (snap.staged?.length ?? 0) > 0 ||
    (snap.untracked?.length ?? 0) > 0 ||
    (snap.merge?.length ?? 0) > 0
  if (dirty) {
    throw new Error(
      `Working tree is not clean — ${operation} requires a clean tree. ` +
        `Commit, stash, or discard changes first.`
    )
  }
}
