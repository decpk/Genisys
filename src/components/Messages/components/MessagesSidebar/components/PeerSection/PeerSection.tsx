import { Collapsible } from 'radix-ui'
import { ChevronDown } from 'lucide-react'
import { useMemo, useState } from 'react'

import { PeerListItem } from '@/components/Messages/components/MessagesSidebar/components/PeerListItem'
import { SearchInput } from '@/components/ui/search-input'

import { peerSectionStyles as s } from './PeerSection.styles'
import type { PeerSectionProps } from './PeerSection.types'

export function PeerSection(props: PeerSectionProps): React.JSX.Element {
  const { title, icon: Icon, peers, variant, emptyLabel } = props

  const [open, setOpen] = useState(true)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return peers
    return peers.filter(
      (peer) =>
        peer.displayName.toLowerCase().includes(q) ||
        peer.host.toLowerCase().includes(q)
    )
  }, [peers, query])

  let body: React.JSX.Element
  if (peers.length === 0) {
    body = <p className={s.empty}>{emptyLabel}</p>
  } else if (filtered.length === 0) {
    body = <p className={s.empty}>No peers match “{query.trim()}”.</p>
  } else {
    body = (
      <div className={s.list}>
        {filtered.map((peer) => (
          <PeerListItem key={peer.id} peer={peer} variant={variant} />
        ))}
      </div>
    )
  }

  return (
    <Collapsible.Root className={s.root} open={open} onOpenChange={setOpen}>
      <Collapsible.Trigger className={s.trigger}>
        <ChevronDown className={s.chevron} />
        <Icon className={s.headerIcon} />
        <span className={s.title}>{title}</span>
        <span className={s.count}>{filtered.length}</span>
      </Collapsible.Trigger>
      <Collapsible.Content>
        {peers.length > 0 && (
          <div className={s.searchWrap}>
            <SearchInput
              placeholder="Search by name or IP…"
              value={query}
              onChange={setQuery}
            />
          </div>
        )}
        {body}
      </Collapsible.Content>
    </Collapsible.Root>
  )
}
