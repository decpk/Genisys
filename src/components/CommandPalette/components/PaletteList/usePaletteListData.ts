import { useVirtualizer } from '@tanstack/react-virtual'
import { useEffect, useRef } from 'react'

const ROW_HEIGHT = 48
const HEADER_HEIGHT = 24

interface UsePaletteListDataInput {
  rowCount: number
  selectedRowIndex: number
  isHeaderAt: (index: number) => boolean
}

export function usePaletteListData(input: UsePaletteListDataInput) {
  const { rowCount, selectedRowIndex, isHeaderAt } = input
  const parentRef = useRef<HTMLDivElement | null>(null)

  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: (index) => (isHeaderAt(index) ? HEADER_HEIGHT : ROW_HEIGHT),
    overscan: 8,
  })

  useEffect(() => {
    if (selectedRowIndex < 0 || selectedRowIndex >= rowCount) return
    virtualizer.scrollToIndex(selectedRowIndex, { align: 'auto' })
  }, [selectedRowIndex, rowCount, virtualizer])

  return {
    parentRef,
    virtualizer,
    virtualItems: virtualizer.getVirtualItems(),
    totalSize: virtualizer.getTotalSize(),
  }
}
