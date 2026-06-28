import { Textarea } from '@/components/ui/textarea'

import { STYLES } from './HtmlSourceField.styles'
import type { HtmlSourceFieldProps } from './HtmlSourceField.types'

export function HtmlSourceField(props: HtmlSourceFieldProps) {
  const { value, onChange } = props

  return (
    <Textarea
      placeholder="<html>…paste raw page markup here…</html>"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={STYLES.textarea}
      autoFocus
      spellCheck={false}
    />
  )
}
