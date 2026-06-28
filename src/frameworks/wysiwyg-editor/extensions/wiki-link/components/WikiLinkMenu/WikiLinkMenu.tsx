import { forwardRef, useImperativeHandle } from 'react'
import { FileText, Plus } from 'lucide-react'

import { useWikiLinkMenuData } from './useWikiLinkMenuData'
import { wikiLinkMenuStyles as styles } from './WikiLinkMenu.styles'
import type {
  WikiLinkMenuHandle,
  WikiLinkMenuProps,
} from './WikiLinkMenu.types'

export const WikiLinkMenu = forwardRef<WikiLinkMenuHandle, WikiLinkMenuProps>(
  function WikiLinkMenu(props, ref) {
    const { items } = props
    const { menuRef, clamped, onSelect, onKeyDown, setSelectedIndex } =
      useWikiLinkMenuData(props)

    useImperativeHandle(ref, () => ({ onKeyDown }), [onKeyDown])

    if (items.length === 0) {
      return (
        <div className={styles.menu}>
          <div className={styles.empty}>Type to link a note…</div>
        </div>
      )
    }

    return (
      <div ref={menuRef} className={styles.menu}>
        {items.map((item, index) => {
          const isSelected = index === clamped
          const itemClass = isSelected
            ? `${styles.item} ${styles.itemSelected}`
            : styles.item
          const Icon = item.isCreate ? Plus : FileText
          const hint = item.isCreate ? 'Create new note' : 'Open'
          return (
            <button
              key={item.id}
              type="button"
              className={itemClass}
              data-selected={isSelected}
              onClick={() => onSelect(index)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <span className={styles.icon}>
                <Icon size={14} />
              </span>
              <span className={styles.body}>
                <span className={styles.label}>{item.title}</span>
                <span className={styles.hint}>{hint}</span>
              </span>
            </button>
          )
        })}
      </div>
    )
  },
)
