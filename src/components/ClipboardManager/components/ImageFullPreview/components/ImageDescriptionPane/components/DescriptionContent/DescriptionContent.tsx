import { descriptionContentStyles as styles } from './DescriptionContent.styles'
import type { DescriptionContentProps } from './DescriptionContent.types'

export function DescriptionContent(props: DescriptionContentProps): React.JSX.Element {
  const { analysisStatus, imageDescription } = props

  if (analysisStatus === 'done' && imageDescription) {
    return <p className={styles.descriptionText}>{imageDescription}</p>
  }
  if (analysisStatus === 'pending') {
    return <p className={styles.statusText}>Analyzing image...</p>
  }
  if (analysisStatus === 'failed') {
    return <p className={styles.statusText}>Analysis failed. Click retry to try again.</p>
  }
  return <p className={styles.statusText}>No description available</p>
}
