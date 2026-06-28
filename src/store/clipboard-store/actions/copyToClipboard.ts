export async function copyToClipboardAction(id: string): Promise<void> {
  try {
    await window.api.copyClipboardItem(id)
  } catch (e) {
    console.error('[clipboard] copyToClipboard failed:', e)
  }
}
