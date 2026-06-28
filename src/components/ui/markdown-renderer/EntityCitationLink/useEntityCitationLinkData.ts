import { useCallback, useMemo } from 'react'

import { getEntityLink } from '@/ai/entity-links/registry/getEntityLink'
import { parseEntityHref } from '@/ai/entity-links/token/parseEntityHref'
import type { EntityLinkHandler } from '@/ai/entity-links/entity-links.types'

interface UseEntityCitationLinkDataResult {
  handler: EntityLinkHandler | undefined
  id: string | null
  onClick: (e: React.MouseEvent) => void
}

export function useEntityCitationLinkData(href: string | undefined): UseEntityCitationLinkDataResult {
  const parsed = useMemo(() => parseEntityHref(href), [href])
  const handler = useMemo(() => (parsed ? getEntityLink(parsed.type) : undefined), [parsed])

  const onClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (!parsed || !handler) return
      void handler.open(parsed.id)
    },
    [parsed, handler],
  )

  return { handler, id: parsed?.id ?? null, onClick }
}
