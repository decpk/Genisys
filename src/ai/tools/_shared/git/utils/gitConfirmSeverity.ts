/**
 * Severity hint surfaced to the confirmation panel. Hosts may map
 * this to an icon / accent color; default rendering is identical to
 * the unspecified case.
 *
 * - `info`     — reversible op (e.g. fetch, stash list)
 * - `caution`  — reversible-but-noisy op (e.g. amend, rename branch)
 * - `danger`   — destructive / irreversible op (e.g. reset --hard,
 *                clean, force delete branch)
 */
export type GitConfirmSeverity = 'info' | 'caution' | 'danger'
