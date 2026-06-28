import { Copy } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { extractedTextModalStyles as styles } from './ExtractedTextModal.styles'
import { useExtractedTextModalData } from './useExtractedTextModalData'
import type { ExtractedTextModalProps } from './ExtractedTextModal.types'

export function ExtractedTextModal(props: ExtractedTextModalProps): React.JSX.Element {
  const { open, onOpenChange, extractedText } = props
  const { charCount, handleCopy } = useExtractedTextModalData(props)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={styles.content}>
        <DialogHeader>
          <div className={styles.headerRow}>
            <DialogTitle>Extracted Text</DialogTitle>
            <button className={styles.copyButton} onClick={handleCopy}>
              <Copy size={14} />
              Copy to Clipboard
            </button>
          </div>
          <DialogDescription className="sr-only">
            Text extracted from clipboard image
          </DialogDescription>
        </DialogHeader>
        <div className={styles.preWrapper}>
          <pre className={styles.pre}>{extractedText}</pre>
        </div>
        <div className={styles.footer}>
          <span>{charCount} characters</span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
