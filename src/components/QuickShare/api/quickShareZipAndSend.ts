/** Result of bundling every shared file into a single zip and sending it. */
export interface QuickShareZipAndSendResult {
  /** File name of the generated archive (e.g. `QuickShare-20260622-101500.zip`). */
  name: string
  /** Size of the archive in bytes. */
  size: number
  /** Number of files bundled into the archive. */
  files: number
  /** Recipient: a device id, or "everyone". */
  target: string
}

/** Bundle every shared file in the tray into one `.zip` and drop it into the
 *  tray addressed to `target` (a device id, or "everyone"). The recipient
 *  receives it over the normal download / auto-pull path. */
export async function quickShareZipAndSend(
  target?: string,
): Promise<QuickShareZipAndSendResult> {
  const res = await window.api.quickShareZipAndSend(target)
  if (!res?.success) {
    throw new Error(res?.error || 'Failed to zip and send')
  }
  return {
    name: res.data?.name ?? 'QuickShare.zip',
    size: res.data?.size ?? 0,
    files: res.data?.files ?? 0,
    target: res.data?.target ?? 'everyone',
  }
}
