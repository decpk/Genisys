import { Plus } from 'lucide-react'

import { VariantItem } from './components/VariantItem'
import type { VariantListProps } from './VariantList.types'
import { variantListStyles as styles } from './VariantList.styles'

export function VariantList(props: VariantListProps) {
  const { mode, variants, onAdd, onDuplicate, onDelete, onUpdate } = props

  let list: React.ReactNode
  if (variants.length === 0) {
    list = <div className={styles.empty}>No variants yet. Add one to get started.</div>
  } else {
    list = variants.map((variant) => (
      <VariantItem
        key={variant.id}
        variant={variant}
        mode={mode}
        onDuplicate={onDuplicate}
        onDelete={onDelete}
        onUpdate={onUpdate}
      />
    ))
  }

  return (
    <div className={styles.root}>
      {list}
      <button type="button" onClick={onAdd} className={styles.addButton}>
        <Plus className="h-3.5 w-3.5" />
        Add variant
      </button>
    </div>
  )
}
