/** Share a text snippet / link into the tray. `target` is a recipient device id,
 *  or "everyone" (the default). */
export async function quickShareAddText(
  text: string,
  target?: string,
): Promise<void> {
  const res = await window.api.quickShareAddText(text, target)
  if (!res?.success) {
    throw new Error(res?.error || 'Failed to send text')
  }
}
