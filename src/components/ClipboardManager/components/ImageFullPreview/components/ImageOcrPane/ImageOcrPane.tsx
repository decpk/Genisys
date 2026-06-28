import { imageOcrPaneStyles as styles } from './ImageOcrPane.styles'
import type { ImageOcrPaneProps } from './ImageOcrPane.types'

export function ImageOcrPane(props: ImageOcrPaneProps): React.JSX.Element {
  const { extractedText } = props

  const hasText = Boolean(extractedText && extractedText.trim().length > 0)

  let body: React.JSX.Element
  if (hasText) {
    body = <p className={styles.text}>{extractedText}</p>
  } else {
    body = <p className={styles.empty}>No extracted text</p>
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.label}>Extracted Text</span>
      </div>
      <div className={styles.body}>{body}</div>
    </div>
  )
}
