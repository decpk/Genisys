/** Clear the entire shared tray. Saved files (if any) are kept on disk. Returns
 *  how many items were removed. */
export async function quickShareRemoveAll(): Promise<number> {
  const res = await window.api.quickShareRemoveAll()
  if (!res?.success) {
    throw new Error(res?.error || 'Failed to remove all')
  }
  return res.data?.removed ?? 0
}
