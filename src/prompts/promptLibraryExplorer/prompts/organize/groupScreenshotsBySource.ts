import { buildExplorerPrompt } from '../../utils/buildExplorerPrompt'
import { organizeAndCategorize } from '../../categories/organizeAndCategorize'

export const groupScreenshotsBySource = buildExplorerPrompt({
  id: 'p-exp-builtin-0103-group-screenshots-by-source',
  categoryId: organizeAndCategorize.id,
  title: 'Group screenshots by source app',
  description: 'Detect the capturing app from filename patterns and bucket screenshots accordingly.',
  sortOrder: 30,
  content: `Sort screenshots in this folder into per-source subfolders.

**Tool note:** \`find_files\` accepts **one glob per call** (no comma lists, no brace expansion). Run each pattern separately and merge results.

1. Run \`find_files\` **separately for each pattern** with \`max_depth=0\`:
   - \`Screenshot*.png\`, \`Screenshot*.jpg\`
   - \`Screen Shot*.png\`, \`Screen Shot*.jpeg\`
   - \`CleanShot*.png\`
   - \`Shottr*.png\`
   - \`*Skitch*\`
2. Bucket each match by source:
   - macOS native (\`Screenshot…\`, \`Screen Shot…\`)    → \`screenshots/macos/\`
   - CleanShot X (\`CleanShot…\`)                       → \`screenshots/cleanshot/\`
   - Shottr (\`Shottr…\`)                                → \`screenshots/shottr/\`
   - Skitch (\`*Skitch*\`)                               → \`screenshots/skitch/\`
   - Other / unknown                                    → \`screenshots/other/\`
3. For each bucket, call \`get_file_info\` on each match to get sizes. Present a table: \`Bucket | File count | Total size | Example filenames\`.
4. Ask for confirmation. After \`CONFIRMED\`:
   - For each non-empty bucket, call \`create_folder\` (it creates parents and silently succeeds if exists).
   - Then \`move_item\` each screenshot to its bucket. \`move_item\` fails if the destination already exists — in that case, append a numeric suffix to the destination filename and retry.
5. Report a final summary: \`N moved across B buckets, M skipped (already in a bucket), E errors\`.`,
})
