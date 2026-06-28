/** Remove an item from the shared tray. The saved file (if any) is kept. */
export async function quickShareRemoveItem(itemId: string): Promise<void> {
  await window.api.quickShareRemoveItem(itemId)
}
