export async function removeLabelFromItemAction(
  itemId: string,
  labelId: string
): Promise<void> {
  await window.api.removeLabelFromClipboardItem(itemId, labelId)
}
