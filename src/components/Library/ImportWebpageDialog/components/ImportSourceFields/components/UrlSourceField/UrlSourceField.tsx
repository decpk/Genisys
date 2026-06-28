import { Input } from '@/components/ui/input'

import type { UrlSourceFieldProps } from './UrlSourceField.types'

export function UrlSourceField(props: UrlSourceFieldProps) {
  const { value, onChange, onSubmit } = props

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') onSubmit()
  }

  return (
    <Input
      placeholder="https://example.com/article"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="mt-1"
      autoFocus
      onKeyDown={handleKeyDown}
    />
  )
}
