import { memo } from 'react'

import { confirmationItemStyles as styles } from '../ConfirmationPanel.styles'
import { renderConfirmationItemIcon } from '../utils/renderConfirmationItemIcon'
import type { ConfirmationItemProps } from './ConfirmationItem.types'

/** Single row in the confirmation panel — file/path + type badge + size. */
export const ConfirmationItem = memo(function ConfirmationItem(
  props: ConfirmationItemProps,
): React.JSX.Element {
  const { item } = props
  const iconNode = renderConfirmationItemIcon({ type: item.type, path: item.path, size: 11 })

  let detailsNode: React.ReactNode = null
  if (item.details) detailsNode = <span className={styles.details}>{item.details}</span>

  let sizeNode: React.ReactNode = null
  if (item.size) sizeNode = <span className={styles.size}>{item.size}</span>

  return (
    <div className={styles.root}>
      <span className={styles.iconWrap}>
        {iconNode}
      </span>
      <div className={styles.body}>
        <span className={styles.path} title={item.path}>
          {item.path}
        </span>
        {detailsNode}
      </div>
      {sizeNode}
      <span className={styles.badge}>{item.type}</span>
    </div>
  )
})
