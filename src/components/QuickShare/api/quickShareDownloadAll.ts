/** Result of gathering every shared file into the QuickShare download folder. */
export interface QuickShareDownloadAllResult {
  /** Files copied in from elsewhere on disk. */
  copied: number
  /** Files already saved in the QuickShare folder (received uploads). */
  alreadySaved: number
  /** Absolute path of the QuickShare download folder. */
  dir: string
}

/** Copy every shared file into the desktop's QuickShare download folder. Files
 *  already there (received uploads) are left untouched. Text items are ignored. */
export async function quickShareDownloadAll(): Promise<QuickShareDownloadAllResult> {
  const res = await window.api.quickShareDownloadAll()
  if (!res?.success) {
    throw new Error(res?.error || 'Failed to download all')
  }
  return {
    copied: res.data?.copied ?? 0,
    alreadySaved: res.data?.alreadySaved ?? 0,
    dir: res.data?.dir ?? '',
  }
}
