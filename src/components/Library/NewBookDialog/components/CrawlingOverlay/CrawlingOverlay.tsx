import { AppLoaderGlyph } from '@/components/AppLoader'
import type { CrawlingOverlayProps } from './CrawlingOverlay.types'
import * as styles from './CrawlingOverlay.styles'

export function CrawlingOverlay(
  props: CrawlingOverlayProps,
): React.JSX.Element {
  const { url, message } = props
  const primary = message ?? 'Fetching webpage…'
  const urlNode = url ? <span className={styles.URL_TEXT}>{url}</span> : null

  return (
    <div className={styles.WRAPPER}>
      <AppLoaderGlyph size={22} className="text-primary" />
      <p className={styles.PRIMARY_TEXT}>{primary}</p>
      <p className={styles.SECONDARY_TEXT}>
        This can take a few seconds for image-heavy pages.
      </p>
      {urlNode}
    </div>
  )
}
