import { memo } from 'react'
import { Link2 } from 'lucide-react'

import { useEntityCitationLinkData } from './useEntityCitationLinkData'
import { entityChipClassName } from './EntityCitationLink.styles'
import type { EntityCitationLinkProps } from './EntityCitationLink.types'

export const EntityCitationLink = memo(function EntityCitationLink(
  props: EntityCitationLinkProps,
): React.JSX.Element {
  const { href, children } = props
  const { handler, onClick } = useEntityCitationLinkData(href)

  let Icon = Link2
  if (handler) Icon = handler.icon

  return (
    <button type="button" onClick={onClick} className={entityChipClassName}>
      <Icon size={10} className="shrink-0" />
      {children}
    </button>
  )
})
