import { buildExplorerPrompt } from '../../utils/buildExplorerPrompt'
import { securityAndSecrets } from '../../categories/securityAndSecrets'

export const findWorldWritableFiles = buildExplorerPrompt({
  id: 'p-exp-builtin-0603-find-world-writable-files',
  categoryId: securityAndSecrets.id,
  title: 'Find files with world-writable permissions',
  description: 'Audit Unix file modes for files that anyone on the system can write to.',
  sortOrder: 30,
  content: `Audit Unix file permissions for files that any user on the system can write.

**Tool note:** \`get_file_info\` returns \`mode\` as an **octal string** on Unix (e.g. \`"100644"\` for a regular file with mode \`0644\`). On Windows the value is \`"N/A"\` — if you see that, abort with the message "World-writable check is Unix-only; this host appears to be Windows." \`find_files\` returns both files and folders and caps at 100 per call.

1. \`find_files pattern="**/*" max_depth=5\`. If exactly 100 results, do per-extension passes and merge.
2. \`get_file_info\` each entry. Check the \`mode\` field:
   - If \`mode == "N/A"\`: report "Unix-only check; aborting" and stop.
   - Otherwise, look at the **last octal digit** of the mode (the "other" permission bits). World-writable means that digit is one of \`2\`, \`3\`, \`6\`, or \`7\`.
3. Also separately note files where the last digit is \`7\` (world-writable + executable) — highest severity.
4. Skip the auto-skipped heavy dirs (\`node_modules\`, \`.git\`, etc.) which the tool already filters.
5. Present a table sorted by severity: \`Path | Mode | World-writable bits | Recommended chmod\`.
6. Recommended chmod for each: \`644\` for files, \`755\` for executables / folders. Show the exact \`chmod\` command the user could run.
7. Read-only — list candidates only; never call any write tool from this prompt.`,
})
