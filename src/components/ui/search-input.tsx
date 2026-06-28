import { Search, X } from 'lucide-react'

import { Input } from '@/components/ui/input'

interface SearchInputProps {
  placeholder: string
  value: string
  onChange: (value: string) => void
  className?: string
  inputClassName?: string
  /** Optional control rendered on the right inside the input (e.g. a toggle). */
  rightSlot?: React.ReactNode
}

export function SearchInput({
  placeholder,
  value,
  onChange,
  className = "",
  inputClassName = "h-8.5",
  rightSlot,
}: SearchInputProps): React.JSX.Element {
  const showClear = value.length > 0
  const hasControls = showClear || Boolean(rightSlot)

  let paddingRight = ""
  if (showClear && rightSlot) paddingRight = "pr-12"
  else if (hasControls) paddingRight = "pr-7"

  let clearButton: React.ReactNode = null
  if (showClear) {
    clearButton = (
      <button
        type="button"
        onClick={() => onChange("")}
        className="flex items-center text-muted-foreground hover:text-foreground cursor-pointer"
      >
        <X size={12} />
      </button>
    )
  }

  let controls: React.ReactNode = null
  if (hasControls) {
    controls = (
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
        {clearButton}
        {rightSlot}
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <Search
        size={12}
        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`pl-7 text-xs bg-muted/50 ${paddingRight} ${inputClassName}`}
      />
      {controls}
    </div>
  );
}
