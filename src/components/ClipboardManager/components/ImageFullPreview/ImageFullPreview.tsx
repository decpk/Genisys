import { ImageOff } from 'lucide-react'
import { AppLoader } from '@/components/AppLoader'
import { ImageDescriptionPane } from './components/ImageDescriptionPane'
import { ImageOcrPane } from './components/ImageOcrPane'
import { useImageFullPreviewData } from './hooks/useImageFullPreviewData'
import { imageFullPreviewStyles as styles } from './ImageFullPreview.styles'
import type { ImageFullPreviewProps } from './ImageFullPreview.types'

export function ImageFullPreview(props: ImageFullPreviewProps): React.JSX.Element {
  const { itemId, imagePath, imageDescription, analysisStatus, extractedText } = props

  const { dataUrl, error, loading } = useImageFullPreviewData(props)

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <ImageOff size={32} />
        <span className={styles.errorText}>Image unavailable</span>
      </div>
    )
  }

  if (loading || !dataUrl) {
    return <AppLoader size={24} text="Loading image…" />
  }

  return (
    <div className={styles.container}>
      <div className={styles.imageWrapper}>
        <img
          src={dataUrl}
          alt="Clipboard image"
          className={styles.image}
        />
      </div>
      <div className={styles.infoColumn}>
        <ImageDescriptionPane
          itemId={itemId}
          imagePath={imagePath}
          imageDescription={imageDescription}
          analysisStatus={analysisStatus}
        />
        <ImageOcrPane extractedText={extractedText} />
      </div>
    </div>
  )
}
