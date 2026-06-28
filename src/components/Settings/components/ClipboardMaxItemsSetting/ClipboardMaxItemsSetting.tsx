import { memo } from 'react'
import { SettingRow } from '../SettingRow'
import { MAX_ITEMS_OPTIONS } from './ClipboardMaxItemsSetting.constants'
import { useClipboardMaxItemsSettingData } from './useClipboardMaxItemsSettingData'

export const ClipboardMaxItemsSetting = memo(function ClipboardMaxItemsSetting(): React.JSX.Element {
  const { clipboardMaxItems, setClipboardMaxItems } = useClipboardMaxItemsSettingData()

  return (
    <SettingRow
      label="Maximum clipboard items"
      description="Limit the number of items stored in the clipboard history. When the limit is reached, the oldest unpinned items are automatically removed (LRU). Pinned items are never evicted."
    >
      <div className="flex rounded-md border border-border overflow-hidden">
        {MAX_ITEMS_OPTIONS.map(({ value, label }) => {
          const isSelected = clipboardMaxItems === value
          const selectedClass = isSelected
            ? 'bg-secondary text-foreground'
            : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'

          return (
            <button
              key={value}
              onClick={() => setClipboardMaxItems(value)}
              className={`px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer ${selectedClass}`}
            >
              {label}
            </button>
          )
        })}
      </div>
    </SettingRow>
  )
})
