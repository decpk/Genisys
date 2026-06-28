import { CalendarArrowDown, CalendarDays, MoreVertical } from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { getTomorrow } from '@/components/DailyPlan/utils/formatDate'
import { formatDateMenuLabel } from '@/components/DailyPlan/utils/formatDateMenuLabel'

import { SectionMoveDialog } from './components/SectionMoveDialog'
import { sectionActionsMenuStyles } from './SectionActionsMenu.styles'
import { useSectionActionsMenuData } from './useSectionActionsMenuData'
import type { MoveMode, SectionActionsMenuProps } from './SectionActionsMenu.types'

export function SectionActionsMenu<T,>(
  props: SectionActionsMenuProps<T>
): React.JSX.Element | null {
  const data = useSectionActionsMenuData(props)
  const {
    scopes,
    isHidden,
    pendingMove,
    dialogOpen,
    openMove,
    closeDialog,
    confirmMove,
    itemNoun,
    sectionTitle,
  } = data

  const tomorrowLabel = formatDateMenuLabel(getTomorrow())

  let dialogMode: MoveMode | null = null
  let dialogItemCount = 0
  if (pendingMove !== null) {
    dialogMode = pendingMove.mode
    dialogItemCount = pendingMove.items.length
  }

  const scopeNodes: React.JSX.Element[] = []
  scopes.forEach((scope, index) => {
    const subTriggerLabel = `${scope.label} (${scope.items.length})`
    const isLast = index === scopes.length - 1

    scopeNodes.push(
      <DropdownMenuSub key={scope.key}>
        <DropdownMenuSubTrigger>{subTriggerLabel}</DropdownMenuSubTrigger>
        <DropdownMenuSubContent>
          <DropdownMenuItem onSelect={() => openMove(scope.items, 'tomorrow')}>
            <CalendarArrowDown />
            Tomorrow — {tomorrowLabel}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => openMove(scope.items, 'pick')}>
            <CalendarDays />
            Pick a date…
          </DropdownMenuItem>
        </DropdownMenuSubContent>
      </DropdownMenuSub>
    )

    if (!isLast) {
      scopeNodes.push(<DropdownMenuSeparator key={`${scope.key}-separator`} />)
    }
  })

  function handleTriggerClick(e: React.MouseEvent<HTMLButtonElement>): void {
    e.stopPropagation()
  }

  if (isHidden) {
    return null
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={sectionActionsMenuStyles.trigger}
            onClick={handleTriggerClick}
            aria-label="Section actions"
          >
            <MoreVertical className="size-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">{scopeNodes}</DropdownMenuContent>
      </DropdownMenu>

      <SectionMoveDialog
        open={dialogOpen}
        mode={dialogMode}
        itemCount={dialogItemCount}
        itemNoun={itemNoun}
        sectionTitle={sectionTitle}
        onConfirm={confirmMove}
        onCancel={closeDialog}
      />
    </>
  )
}
