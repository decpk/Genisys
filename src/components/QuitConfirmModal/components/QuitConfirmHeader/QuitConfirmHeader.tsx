import { Dialog as DialogPrimitive } from 'radix-ui'

import type { QuitConfirmHeaderProps } from './QuitConfirmHeader.types'
import { quitConfirmHeaderStyles as styles } from './QuitConfirmHeader.styles'

export function QuitConfirmHeader(props: QuitConfirmHeaderProps): React.JSX.Element {
  const { eyebrow, title, description } = props
  return (
    <div className={styles.wrapper}>
      {eyebrow ? (
        <span className={styles.eyebrow}>
          <span className={styles.eyebrowDot} aria-hidden="true" />
          {eyebrow}
        </span>
      ) : null}
      <DialogPrimitive.Title className={styles.title}>{title}</DialogPrimitive.Title>
      <DialogPrimitive.Description className={styles.description}>
        {description}
      </DialogPrimitive.Description>
    </div>
  )
}
