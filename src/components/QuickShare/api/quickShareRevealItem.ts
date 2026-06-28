/** Reveal a shared file in the OS file manager (Finder/Explorer), highlighting
 *  it inside the folder it was saved to. */
export async function quickShareRevealItem(itemId: string): Promise<void> {
  const res = await window.api.quickShareRevealItem(itemId)
  if (!res?.success) {
    throw new Error(res?.error || 'Failed to open folder')
  }
}
