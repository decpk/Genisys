export async function addLabelToItemAction(
  itemId: string,
  labelId: string
): Promise<void> {
  await window.api.addLabelToClipboardItem(itemId, labelId)
}
