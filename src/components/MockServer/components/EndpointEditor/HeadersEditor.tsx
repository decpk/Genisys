import { Plus, Trash2 } from 'lucide-react'
import { Tooltip } from '@/components/Tooltip'

interface HeaderPair {
  key: string
  value: string
}

interface HeadersEditorProps {
  headers: HeaderPair[]
  onChange: (headers: HeaderPair[]) => void
}

export function HeadersEditor(props: HeadersEditorProps) {
  const { headers, onChange } = props

  const handleKeyChange = (index: number, key: string) => {
    const next = [...headers]
    next[index] = { ...next[index], key }
    onChange(next)
  }

  const handleValueChange = (index: number, value: string) => {
    const next = [...headers]
    next[index] = { ...next[index], value }
    onChange(next)
  }

  const handleAdd = () => {
    onChange([...headers, { key: '', value: '' }])
  }

  const handleRemove = (index: number) => {
    const next = headers.filter((_, i) => i !== index)
    onChange(next)
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <span className="w-[200px]">Header Name</span>
        <span className="flex-1">Value</span>
      </div>

      {headers.map((header, index) => (
        <div key={index} className="flex items-center gap-2">
          <input
            type="text"
            value={header.key}
            onChange={(e) => handleKeyChange(index, e.target.value)}
            placeholder="Header name"
            className="h-8 w-[200px] rounded-md border border-transparent bg-background px-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-input focus:ring-1 focus:ring-ring/20"
          />
          <input
            type="text"
            value={header.value}
            onChange={(e) => handleValueChange(index, e.target.value)}
            placeholder="Value"
            className="h-8 flex-1 rounded-md border border-transparent bg-background px-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-input focus:ring-1 focus:ring-ring/20"
          />
          <Tooltip content="Remove this header" side="top">
            <button
              onClick={() => handleRemove(index)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-red-500/15 hover:text-red-500"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </Tooltip>
        </div>
      ))}

      <Tooltip content="Add a new header row" side="top">
        <button
          onClick={handleAdd}
          className="inline-flex h-7 items-center gap-1 self-start rounded-md px-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Header
        </button>
      </Tooltip>
    </div>
  )
}
