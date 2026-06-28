import { ChevronDown } from 'lucide-react'

import { AppLoaderGlyph } from '@/components/AppLoader'
import { Tooltip } from '@/components/Tooltip'
import { Dropdown, type DropdownGroup } from '@/components/ui/dropdown'
import { ProviderIcon } from './ProviderIcon'
import { PROVIDER_LABELS, getProviderFromModelId } from './ModelSelector.constants'
import { useModelSelector } from './hooks'
import type { ModelSelectorProps } from './ModelSelector.types'

export function ModelSelector({
  selectedModelId,
  onModelChange,
  trigger = 'icon'
}: ModelSelectorProps): React.JSX.Element {
  const { selected, groups, isLoading } = useModelSelector(selectedModelId, onModelChange)

  // While models are loading (or none came back) we render a placeholder so
  // the trigger stays usable but doesn't show a possibly-stale predefined
  // label. Once models resolve, `selected` is populated and the real label
  // takes over.
  const placeholderLabel = isLoading ? 'Loading models…' : 'No models available'
  const triggerLabel = selected?.label ?? placeholderLabel
  const triggerProvider = selected?.provider ?? getProviderFromModelId(selectedModelId || '')

  const dropdownGroups: DropdownGroup[] = groups.map((group) => ({
    key: group.provider,
    label: PROVIDER_LABELS[group.provider],
    icon: ({ size, className }: { size: number; className?: string }) => (
      <ProviderIcon provider={group.provider} size={size} className={className} />
    ),
    items: group.models.map((m) => ({
      key: m.id,
      label: m.label,
      description: m.description,
      active: selectedModelId === m.id,
      icon: ({ size, className }: { size: number; className?: string }) => (
        <ProviderIcon provider={m.provider} size={size} className={className} />
      ),
      onSelect: () => onModelChange(m.id),
    })),
  }))

  const iconTrigger = (
    <Tooltip content={triggerLabel} side="top">
      <button
        type="button"
        className="w-7 h-7 shrink-0 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors cursor-pointer"
      >
        {selected ? (
          <ProviderIcon provider={triggerProvider} size={15} />
        ) : isLoading ? (
          <AppLoaderGlyph size={13} />
        ) : (
          <ProviderIcon provider={triggerProvider} size={13} className="opacity-50" />
        )}
      </button>
    </Tooltip>
  )

  const pillTrigger = (
    <button
      type="button"
      className="inline-flex w-full min-w-0 max-w-full items-center gap-1.5 h-7 px-2 rounded-md border border-border bg-background text-[11px] text-foreground hover:bg-accent transition-colors cursor-pointer"
    >
      {selected ? (
        <ProviderIcon provider={triggerProvider} size={13} className="shrink-0" />
      ) : isLoading ? (
        <AppLoaderGlyph size={11} className="shrink-0 text-muted-foreground" />
      ) : (
        <ProviderIcon
          provider={triggerProvider}
          size={11}
          className="shrink-0 text-muted-foreground opacity-60"
        />
      )}
      <span className="min-w-0 flex-1 truncate text-left">{triggerLabel}</span>
      <ChevronDown size={11} className="shrink-0 text-muted-foreground" />
    </button>
  )

  return (
    <Dropdown
      openOn="click"
      groups={dropdownGroups}
      side={trigger === 'pill' ? 'bottom' : 'top'}
      align="left"
      menuWidth="fit-content"
      maxHeight="400px"
      fill={trigger === 'pill'}
      trigger={trigger === 'pill' ? pillTrigger : iconTrigger}
    />
  );
}
