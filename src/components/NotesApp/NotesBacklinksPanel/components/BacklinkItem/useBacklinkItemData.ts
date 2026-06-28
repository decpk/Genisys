import { useCallback } from 'react'

import type { BacklinkItemProps } from './BacklinkItem.types'

interface BacklinkItemData {
  handleClick: () => void
}

export function useBacklinkItemData(props: BacklinkItemProps): BacklinkItemData {
  const { item, onOpen } = props

  const handleClick = useCallback(() => {
    onOpen(item.noteId)
  }, [onOpen, item.noteId])

  return { handleClick }
}
