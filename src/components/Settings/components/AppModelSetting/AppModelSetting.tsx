import { memo } from 'react'
import { ChevronDown } from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { AppInlineLoader } from '@/components/AppLoader'
import { SettingRow } from '../SettingRow'
import { appModelSettingStyles as s } from './AppModelSetting.styles'
import { useAppModelSettingData } from './useAppModelSettingData'
import type { AppModelSettingProps } from './AppModelSetting.types'

export const AppModelSetting = memo(function AppModelSetting(
  props: AppModelSettingProps,
): React.JSX.Element {
  const { appId, label, description, defaultModelId } = props
  const {
    isOpen,
    isLoading,
    allModels,
    modelLabel,
    defaultModelLabel,
    handleOpenChange,
    handleModelSelect,
  } = useAppModelSettingData(appId, defaultModelId)

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
        <DropdownMenuItem onSelect={() => handleModelSelect(undefined)} className={s.defaultItem}>
          Use default ({defaultModelLabel})
        </DropdownMenuItem>
        <DropdownMenuSeparator />
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
    <SettingRow label={label} description={description}>
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
