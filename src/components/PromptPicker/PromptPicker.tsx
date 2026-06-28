import { useState } from 'react'
import { Popover as PopoverPrimitive } from 'radix-ui'

import type { PmPrompt } from '@/store/prompt-manager-store'

import { PromptPickerTrigger } from './components/PromptPickerTrigger'
import { PromptPickerSearch } from './components/PromptPickerSearch'
import { PromptPickerFolderRow } from './components/PromptPickerFolderRow'
import { PromptPickerEmptyState } from './components/PromptPickerEmptyState'
import { promptPickerStyles } from './PromptPicker.styles'
import { usePromptPickerData } from './usePromptPickerData'
import { isHoverCardTarget } from './utils/isHoverCardTarget'
import type { PromptPickerProps } from './PromptPicker.types'

export function PromptPicker(props: PromptPickerProps): React.JSX.Element {
  const { appId, onSelect, trigger, side = 'top', align = 'start' } = props
  const { open: controlledOpen, onOpenChange } = props
  const [internalOpen, setInternalOpen] = useState(false)
  const open = controlledOpen ?? internalOpen
  const setOpen = (next: boolean) => {
    if (controlledOpen === undefined) setInternalOpen(next)
    onOpenChange?.(next)
  }
  const data = usePromptPickerData(appId)

  const handleSelect = (prompt: PmPrompt) => {
    onSelect(prompt)
    setOpen(false)
    data.setQuery('')
  }

  const hasResults = data.groups.length > 0
  const expandAll = data.query.trim().length > 0

  let body: React.ReactNode
  if (!hasResults) {
    body = <PromptPickerEmptyState hasQuery={data.query.length > 0} isLoaded={data.isLoaded} />
  } else {
    body = (
      <div className={promptPickerStyles.listWrap}>
        {data.groups.map((group) => (
          <PromptPickerFolderRow
            key={group.folder.id}
            group={group}
            defaultExpanded={expandAll}
            onSelectPrompt={handleSelect}
          />
        ))}
      </div>
    )
  }

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild>
        {trigger ?? <PromptPickerTrigger />}
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          className={promptPickerStyles.content}
          side={side}
          align={align}
          sideOffset={6}
          onInteractOutside={(event) => {
            // Keep the picker open while the user interacts with a hover
            // preview (portaled to body), so they can move into it and
            // select text without dismissing the picker.
            if (isHoverCardTarget(event.target)) {
              event.preventDefault()
            }
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <PromptPickerSearch query={data.query} onQueryChange={data.setQuery} />
          {body}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}
