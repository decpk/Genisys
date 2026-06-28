import { buildExplorerPrompt } from '../../utils/buildExplorerPrompt'
import { organizeAndCategorize } from '../../categories/organizeAndCategorize'

export const sortScreenshotsByDate = buildExplorerPrompt({
  id: 'p-exp-builtin-0106-sort-screenshots-by-date',
  categoryId: organizeAndCategorize.id,
  title: 'Categorize screenshots into YYYY/MM/DD subfolders',
  description: 'Detect screenshot files and move them into nested year/month/day folders based on capture date.',
  sortOrder: 60,
  content: `Categorize every screenshot in this folder into a nested \`YYYY/MM/DD/\` archive.

**Tool note:** \`find_files\` accepts **one glob per call** (no comma lists). \`create_folder\` creates all parent directories in one call and succeeds silently if the path already exists. \`move_item\` fails if the destination path already exists.

1. Detect screenshot files by running \`find_files\` **separately for each pattern** with \`max_depth=0\`:
   - \`Screenshot*.png\`, \`Screenshot*.jpg\`
   - \`Screen Shot*.png\`, \`Screen Shot*.jpeg\`
   - \`CleanShot*.png\`
   - \`Shottr*.png\`
   - \`*Skitch*\`
   - \`SCR-*.png\`, \`SCR-*.jpg\` (Android)
2. For each match, determine the capture date in this order of preference:
   a. Parse from the filename if it follows a date pattern (e.g. \`Screenshot 2025-03-14 at 09.41.02.png\`, \`Screen Shot 2025-03-14 at 9.41.02 AM.png\`, \`CleanShot 2025-03-14 at 09.41@2x.png\`).
   b. Otherwise fall back to \`get_file_info\` and use the \`modified\` ISO timestamp.
3. Compute the target path for each file as \`YYYY/MM/DD/<original-basename>\` (zero-padded month and day, e.g. \`2025/03/14/Screenshot.png\`).
4. Skip screenshots that already live inside a path matching the \`YYYY/MM/DD/\` shape — these are already organized.
5. Present the plan as a table grouped by day: \`YYYY-MM-DD | File count | Total size | Example filenames\`. Add a totals row.
6. Ask for confirmation. Do not call any write tool yet.
7. After \`CONFIRMED\`:
   - For every distinct target day folder, call \`create_folder folder_path="YYYY/MM/DD"\` once. The tool creates the year and month parents automatically.
   - For each screenshot, call \`move_item source=<original> destination="YYYY/MM/DD/<basename>"\`. If \`move_item\` fails because the destination already exists, append \` (1)\`, \` (2)\`, … to the destination basename until it succeeds.
8. Report a final summary: \`N screenshots moved across D day folders, M skipped (already nested), C collisions resolved by suffix, E errors\`.`,
})
