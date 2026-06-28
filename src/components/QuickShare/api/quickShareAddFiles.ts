/** Share local files (by absolute path) into the tray. Returns the count added.
 *  `target` is a recipient device id, or "everyone" (the default). */
export async function quickShareAddFiles(
  paths: string[],
  target?: string,
): Promise<number> {
  const res = await window.api.quickShareAddFiles(paths, target)
  if (!res?.success) {
    throw new Error(res?.error || 'Failed to add files')
  }
  return res.data?.added ?? 0
}
