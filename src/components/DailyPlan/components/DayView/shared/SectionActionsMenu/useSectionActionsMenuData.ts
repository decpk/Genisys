import { useState } from 'react'

import { buildMoveScopes } from './utils/buildMoveScopes'
import type {
  MoveMode,
  MoveScopeDescriptor,
  PendingMove,
  SectionActionsMenuProps,
} from './SectionActionsMenu.types'

export function useSectionActionsMenuData<T>(props: SectionActionsMenuProps<T>) {
  const { items, itemNoun, sectionTitle, moveItem, saveItem, getIsCompleted } = props

  const [pendingMove, setPendingMove] = useState<PendingMove<T> | null>(null)

  const scopes: MoveScopeDescriptor<T>[] = buildMoveScopes({ items, getIsCompleted })
  const isHidden = items.length === 0
  const dialogOpen = pendingMove !== null

  function openMove(scopeItems: T[], mode: MoveMode): void {
    setPendingMove({ items: scopeItems, mode })
  }

  function closeDialog(): void {
    setPendingMove(null)
  }

  async function confirmMove(targetDate: string): Promise<void> {
    if (pendingMove === null) {
      return
    }

    for (const item of pendingMove.items) {
      await saveItem(moveItem(item, targetDate))
    }

    closeDialog()
  }

  return {
    scopes,
    isHidden,
    pendingMove,
    dialogOpen,
    openMove,
    closeDialog,
    confirmMove,
    itemNoun,
    sectionTitle,
  }
}
