import { ImageUp, Upload } from 'lucide-react'

import { Button } from '@/components/ui/button'

import type { ScreenshotDropZoneProps } from './ScreenshotDropZone.types'
import { STYLES } from './ScreenshotDropZone.styles'

/** Drop / paste / pick target shown before an image has been chosen. */
export function ScreenshotDropZone(props: ScreenshotDropZoneProps): React.JSX.Element {
  const { fileInputRef, onDrop, onDragOver, onChooseImage, onFileChange } = props

  return (
    <div className={STYLES.zone} onDrop={onDrop} onDragOver={onDragOver}>
      <ImageUp size={28} className={STYLES.icon} />
      <p className={STYLES.hint}>Drop or paste a screenshot of your browser tabs</p>
      <Button type="button" variant="outline" size="sm" onClick={onChooseImage}>
        <Upload size={14} />
        Choose image
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className={STYLES.hiddenInput}
        onChange={onFileChange}
      />
    </div>
  )
}
