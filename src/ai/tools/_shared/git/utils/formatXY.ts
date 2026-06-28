/**
 * Map a porcelain v2 XY status code to a human-readable label suitable
 * for tool output. Falls back to the raw code when not recognised.
 *
 * X is the staged side (index vs HEAD), Y is the unstaged side (working
 * tree vs index). When the table contains more than one entry per code
 * we surface the most common interpretation.
 */
export function formatXY(xy: string): string {
  const map: Record<string, string> = {
    'M.': 'modified (staged)',
    '.M': 'modified',
    'MM': 'modified (staged + further changes)',
    'A.': 'added (staged)',
    '.A': 'added',
    'AM': 'added (further changes)',
    'D.': 'deleted (staged)',
    '.D': 'deleted',
    'R.': 'renamed (staged)',
    '.R': 'renamed',
    'C.': 'copied (staged)',
    '.C': 'copied',
    '??': 'untracked',
    '!!': 'ignored',
    'UU': 'conflict (both modified)',
    'AA': 'conflict (both added)',
    'DD': 'conflict (both deleted)',
    'AU': 'conflict (added by us)',
    'UA': 'conflict (added by them)',
    'DU': 'conflict (deleted by us)',
    'UD': 'conflict (deleted by them)',
  }
  return map[xy] ?? xy
}
