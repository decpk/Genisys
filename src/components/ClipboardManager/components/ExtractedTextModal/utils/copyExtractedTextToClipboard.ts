import { scopedToast } from '@/frameworks/notification'

const toast = scopedToast('clipboard')

export async function copyExtractedTextToClipboard(text: string): Promise<void> {
  await navigator.clipboard.writeText(text)
  toast.success('Copied extracted text')
}
