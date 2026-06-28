import type { ClipboardGet, ClipboardSet, ClipboardItem } from '../clipboard-store.types'

export function updateItemAnalysisAction(
  get: ClipboardGet,
  set: ClipboardSet,
  itemId: string,
  description: string | null,
  status: ClipboardItem['analysisStatus'],
  extractedText?: string | null
): void {
  set({
    items: get().items.map((i) =>
      i.id === itemId
        ? {
            ...i,
            imageDescription: description,
            analysisStatus: status,
            ...(extractedText !== undefined ? { extractedText } : {}),
          }
        : i
    ),
  })
}
