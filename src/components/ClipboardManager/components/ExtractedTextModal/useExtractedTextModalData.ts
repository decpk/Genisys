import { useCallback } from 'react'
import { copyExtractedTextToClipboard } from './utils/copyExtractedTextToClipboard'
import type { ExtractedTextModalProps } from './ExtractedTextModal.types'

export function useExtractedTextModalData(props: ExtractedTextModalProps) {
  const { extractedText } = props

  const charCount = extractedText.length

  const handleCopy = useCallback(async () => {
    await copyExtractedTextToClipboard(extractedText)
  }, [extractedText])

  return {
    charCount,
    handleCopy,
  }
}
