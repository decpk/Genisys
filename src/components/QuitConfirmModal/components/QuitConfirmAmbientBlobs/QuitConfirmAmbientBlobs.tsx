import { quitConfirmAmbientBlobsStyles as styles } from './QuitConfirmAmbientBlobs.styles'

export function QuitConfirmAmbientBlobs(): React.JSX.Element {
  return (
    <div className={styles.root} aria-hidden="true">
      <div className={styles.blobCenter} />
      <div className={styles.blobTop} />
      <div className={styles.blobBottom} />
    </div>
  )
}
