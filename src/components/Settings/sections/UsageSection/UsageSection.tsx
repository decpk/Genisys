import { memo } from 'react'

import { USAGE_RANGE_OPTIONS } from './UsageSection.constants'
import { useUsageSectionData } from './useUsageSectionData'
import { hasUsageData } from './utils/hasUsageData'
import { RangeSelector } from './components/RangeSelector'
import { UsageBody } from './components/UsageBody'
import { ClearUsageDataButton } from './components/ClearUsageDataButton'

export const UsageSection = memo(function UsageSection(): React.JSX.Element {
  const vm = useUsageSectionData()
  const showEmpty = !vm.stats || !hasUsageData(vm.stats)

  return (
    <div className="flex flex-col gap-5 pb-6">
      <div className="flex items-center justify-end">
        <RangeSelector value={vm.preset} options={USAGE_RANGE_OPTIONS} onChange={vm.setPreset} />
      </div>

      <UsageBody isLoading={vm.isLoading} error={vm.error} showEmpty={showEmpty} stats={vm.stats} />

      <div className="mt-2 border-t border-border/40 pt-2">
        <div className="flex items-center justify-between gap-4 py-4">
          <p className="max-w-md text-xs text-muted-foreground">
            Remove all locally stored usage history. This cannot be undone.
          </p>
          <ClearUsageDataButton clearing={vm.clearing} onConfirm={vm.clear} />
        </div>
      </div>
    </div>
  )
})
