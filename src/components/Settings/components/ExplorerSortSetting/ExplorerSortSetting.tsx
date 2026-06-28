import { memo } from 'react'
import { ArrowUp, ArrowDown } from 'lucide-react'

import { ButtonGroup } from '@/components/ui/button-group'
import { IconButton } from '@/components/ui/icon-button'
import { useSettingsStore } from '@/store/settings-store'
import { EXPLORER_SORT_FIELD_OPTIONS } from '../../Settings.constants'
import { SettingRow } from '../SettingRow'

export const ExplorerSortSetting = memo(function ExplorerSortSetting(): React.JSX.Element {
  const sortField = useSettingsStore((s) => s.explorerSortField)
  const setSortField = useSettingsStore((s) => s.setExplorerSortField)
  const sortDirection = useSettingsStore((s) => s.explorerSortDirection)
  const setSortDirection = useSettingsStore((s) => s.setExplorerSortDirection)

  const DirIcon = sortDirection === 'asc' ? ArrowUp : ArrowDown

  return (
    <SettingRow
      label="Default explorer sort"
      description="Controls the initial sort field and direction when browsing repository contents in the Explorer."
    >
      <div className="flex items-center gap-2">
        <ButtonGroup
          options={EXPLORER_SORT_FIELD_OPTIONS}
          value={sortField}
          onChange={setSortField}
        />

        <IconButton
          variant="outlined"
          onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
          tooltip={sortDirection === 'asc' ? 'Ascending' : 'Descending'}
        >
          <DirIcon size={14} />
        </IconButton>
      </div>
    </SettingRow>
  )
})
