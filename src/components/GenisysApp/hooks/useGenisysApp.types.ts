import type { ActivityBarPosition } from '@/store/settings-store'

import type { UseAppModeReturn } from './useAppMode.types'

export type UseGenisysAppReturn = UseAppModeReturn & {
  activityBarPosition: ActivityBarPosition
}
