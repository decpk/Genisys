import type { AddStockInput, StockSearchResult } from '@/store/stocks-tile-store'

export interface AddStockDialogProps {
  isOpen: boolean
  onClose: () => void
  existingSymbols: string[]
  onAdd: (input: AddStockInput) => void
}

export interface UseAddStockDialogDataResult {
  query: string
  setQuery: (q: string) => void
  results: StockSearchResult[]
  loading: boolean
  error: string | null
  selectedIndex: number
  setSelectedIndex: (i: number) => void
  pickResult: (r: StockSearchResult) => void
}
