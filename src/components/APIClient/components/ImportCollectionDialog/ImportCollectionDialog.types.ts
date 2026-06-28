import type {
  CollectionImportFormat,
  NormalizedImportCollection,
} from '../../utils/collection-import/collection-import.types'

export interface ImportCollectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export interface CollectionImportPreviewData {
  format: CollectionImportFormat
  collection: NormalizedImportCollection
  /** Number of distinct folderPath prefixes across all imported requests. */
  folderCount: number
}
