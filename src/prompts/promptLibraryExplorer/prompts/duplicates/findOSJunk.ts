import { buildExplorerPrompt } from '../../utils/buildExplorerPrompt'
import { duplicatesAndCleanup } from '../../categories/duplicatesAndCleanup'

export const findOSJunk = buildExplorerPrompt({
  id: 'p-exp-builtin-0204-find-os-junk',
  categoryId: duplicatesAndCleanup.id,
  title: 'Find OS junk files (.DS_Store, Thumbs.db, *.tmp)',
  description: `Locate operating-system clutter that's almost always safe to remove.`,
  sortOrder: 40,
  content: `Find OS-generated junk files in this directory tree.

**Tool note:** \`find_files\` accepts only **one glob per call** (\`*.{a,b}\` brace expansion is not supported). \`get_disk_usage\` takes a **single path** (not a pattern), so per-pattern totals must be summed from \`get_file_info\` calls on each match.

1. Run \`find_files\` separately for each pattern with \`max_depth=8\`:
   - \`.DS_Store\`, \`Thumbs.db\`, \`desktop.ini\`, \`*.tmp\`, \`*.bak\`, \`*.swp\`, \`*~\`, \`~$*\`, \`.AppleDouble\`, \`._*\`
2. For each match, call \`get_file_info\` to read its size in bytes.
3. Group results by pattern and report: \`Pattern | File count | Total size (sum of sizes) | First 3 example paths\`.
4. Add a grand total: total file count + total reclaimable bytes across all patterns.
5. Ask for confirmation (this is destructive). Wait for the user to reply \`CONFIRMED\` (or equivalent). Then iterate matches and call \`delete_item\` on each.
6. Report final outcome: \`N files deleted, X bytes reclaimed, E errors\`. If any \`delete_item\` failed, list which paths and continue.`,
})
