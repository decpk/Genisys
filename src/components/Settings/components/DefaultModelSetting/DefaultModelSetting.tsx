import { memo } from 'react'
import { ChevronDown } from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { AppInlineLoader } from '@/components/AppLoader'
import { SettingRow } from '../SettingRow'
import { defaultModelSettingStyles as s } from './DefaultModelSetting.styles'
import { useDefaultModelSettingData } from './useDefaultModelSettingData'

export const DefaultModelSetting = memo(function DefaultModelSetting(): React.JSX.Element {
  const { isOpen, isLoading, allModels, modelLabel, handleOpenChange, handleModelSelect } =
    useDefaultModelSettingData()

  let menuBody: React.JSX.Element
  if (isLoading) {
    menuBody = (
      <div className={s.loaderWrap}>
        <AppInlineLoader message="Loading models…" size={14} />
      </div>
    )
  } else if (allModels.length === 0) {
    menuBody = <div className={s.emptyState}>No models available</div>
  } else {
    menuBody = (
      <>
        {allModels.map((model) => (
          <DropdownMenuItem
            key={model.id}
            onSelect={() => handleModelSelect(model.id)}
            className={s.modelItem}
          >
            <span className={s.modelItemLabel}>{model.label}</span>
            <span className={s.modelItemMeta}>{model.description}</span>
          </DropdownMenuItem>
        ))}
      </>
    )
  }

  return (
    <SettingRow
      label="Default AI Model"
      description="The AI model used across all apps unless a per-app override is set below."
    >
      <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
        <DropdownMenuTrigger asChild>
          <button type="button" className={s.modelButton}>
            <span>{modelLabel}</span>
            <ChevronDown size={12} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={4} className={s.dropdownContent}>
          {menuBody}
        </DropdownMenuContent>
      </DropdownMenu>
    </SettingRow>
  )
})
