import { Plus, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import type { PresetBestForListProps } from './PresetBestForList.types'

const DEFAULT_MAX_ITEMS = 5

export function PresetBestForList(
  props: PresetBestForListProps,
): React.JSX.Element {
  const { value, onChange, maxItems = DEFAULT_MAX_ITEMS } = props

  const handleItemChange = (idx: number, next: string) => {
    const copy = value.slice()
    copy[idx] = next
    onChange(copy)
  }

  const handleAdd = () => {
    if (value.length >= maxItems) return
    onChange([...value, ''])
  }

  const handleRemove = (idx: number) => {
    const copy = value.slice()
    copy.splice(idx, 1)
    if (copy.length === 0) copy.push('')
    onChange(copy)
  }

  const canAdd = value.length < maxItems

  return (
    <div className="flex flex-col gap-1.5">
      {value.map((item, idx) => (
        <div key={idx} className="flex items-center gap-1.5">
          <Input
            value={item}
            placeholder={`Use case ${idx + 1}`}
            onChange={(e) => handleItemChange(idx, e.target.value)}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`Remove use case ${idx + 1}`}
            onClick={() => handleRemove(idx)}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleAdd}
        disabled={!canAdd}
        className="self-start"
      >
        <Plus size={14} />
        Add use case
      </Button>
    </div>
  )
}
