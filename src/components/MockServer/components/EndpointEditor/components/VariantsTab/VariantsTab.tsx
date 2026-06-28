import { useVariantsTabData } from './useVariantsTabData'
import { getVariantModeDescription } from './utils/getVariantModeDescription'
import { VariantModeSelector } from './components/VariantModeSelector'
import { VariantList } from './components/VariantList'
import { variantsTabStyles as styles } from './VariantsTab.styles'

export function VariantsTab() {
  const {
    mode,
    variants,
    setMode,
    handleAddVariant,
    handleDuplicateVariant,
    handleDeleteVariant,
    handleUpdateVariant,
  } = useVariantsTabData()

  let content: React.ReactNode
  if (mode === 'single') {
    content = <div className={styles.emptyState}>{getVariantModeDescription('single')}</div>
  } else {
    content = (
      <>
        <p className={styles.description}>{getVariantModeDescription(mode)}</p>
        <VariantList
          mode={mode}
          variants={variants}
          onAdd={handleAddVariant}
          onDuplicate={handleDuplicateVariant}
          onDelete={handleDeleteVariant}
          onUpdate={handleUpdateVariant}
        />
      </>
    )
  }

  return (
    <div className={styles.root}>
      <VariantModeSelector mode={mode} onChange={setMode} />
      {content}
    </div>
  )
}
