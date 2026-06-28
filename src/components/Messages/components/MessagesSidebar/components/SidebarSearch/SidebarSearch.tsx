import { Search } from 'lucide-react'

import { sidebarSearchStyles as s } from './SidebarSearch.styles'
import type { SidebarSearchProps } from './SidebarSearch.types'

export function SidebarSearch(props: SidebarSearchProps): React.JSX.Element {
  const { value, onChange } = props

  return (
    <div className={s.wrap}>
      <Search className={s.icon} />
      <input
        type="text"
        className={s.input}
        placeholder="Search peers"
        aria-label="Search peers"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}
