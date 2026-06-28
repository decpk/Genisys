export interface AppendDroppedFilesResult {
  /** Number of files actually appended to the selection. */
  added: number
  /** Number of dropped paths skipped because they did not match the markdown extensions. */
  skippedNonMarkdown: number
  /** Number of markdown paths skipped because they were already in the selection. */
  skippedDuplicate: number
}
