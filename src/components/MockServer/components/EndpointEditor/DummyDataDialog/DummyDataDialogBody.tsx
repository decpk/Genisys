import { Database } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'

import { useDummyDataDialogData } from './useDummyDataDialogData'
import { DummyDataCategoryList } from './components/DummyDataCategoryList'
import { DummyDataCountControl } from './components/DummyDataCountControl'
import { DummyDataPreview } from './components/DummyDataPreview'
import { dummyDataDialogStyles as styles } from './DummyDataDialog.styles'
import type { DummyDataDialogBodyProps } from './DummyDataDialogBody.types'

export function DummyDataDialogBody(props: DummyDataDialogBodyProps) {
  const {
    collectionCategories,
    responseCategories,
    selectedCategoryId,
    count,
    showCountControl,
    previewJson,
    canInsert,
    handleSelectCategory,
    handleCountChange,
    handleRegenerate,
    handleInsert,
    handleCancel,
  } = useDummyDataDialogData(props)

  return (
    <>
      <div className={styles.body}>
        <div className={styles.listColumn}>
          <DummyDataCategoryList
            title="Collections"
            categories={collectionCategories}
            selectedId={selectedCategoryId}
            onSelect={handleSelectCategory}
          />
          <DummyDataCategoryList
            title="Responses"
            categories={responseCategories}
            selectedId={selectedCategoryId}
            onSelect={handleSelectCategory}
          />
        </div>

        <div className={styles.previewColumn}>
          {showCountControl && (
            <DummyDataCountControl value={count} onChange={handleCountChange} />
          )}
          <DummyDataPreview json={previewJson} onRegenerate={handleRegenerate} />
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
        <Button onClick={handleInsert} disabled={!canInsert}>
          <Database className="h-3.5 w-3.5" />
          Insert
        </Button>
      </DialogFooter>
    </>
  )
}
