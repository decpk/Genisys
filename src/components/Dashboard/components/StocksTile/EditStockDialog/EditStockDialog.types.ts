import type { StockWatchItem, UpdateStockPatch } from '@/store/stocks-tile-store'

export interface EditStockDialogProps {
  isOpen: boolean
  item: StockWatchItem | null
  onClose: () => void
  onSave: (id: string, patch: UpdateStockPatch) => void
}
