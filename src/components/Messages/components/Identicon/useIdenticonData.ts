import { useMemo } from 'react'

import type { IdenticonData } from './Identicon.types'
import { buildIdenticonCells } from './utils/buildIdenticonCells'
import { hashString } from './utils/hashString'
import { pickGradient } from './utils/pickGradient'

export function useIdenticonData(seed: string): IdenticonData {
  return useMemo(() => {
    const hash = hashString(seed || 'genisys-peer')
    return {
      gradient: pickGradient(hash),
      cells: buildIdenticonCells(hash),
      gradientId: `msg-identicon-${hash}`,
    }
  }, [seed])
}
