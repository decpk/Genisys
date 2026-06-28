import { useCallback, useState } from 'react'
import { ChevronDown } from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'

import { AppInlineLoader } from '@/components/AppLoader'
import { cn } from '@/lib/utils'
import { ProviderIcon } from '@/components/Chat/components/ModelSelector'
import { useOnDemandModelSelector } from '@/components/Chat/components/ModelSelector/hooks/useOnDemandModelSelector'

import type { InlineModelPickerProps } from './InlineModelPicker.types'

export function InlineModelPicker({
  selectedModelId,
  onModelChange,
}: InlineModelPickerProps): React.JSX.Element {
  const { selected, groups, fetchModels, isLoading } = useOnDemandModelSelector(selectedModelId, onModelChange)
  const [isOpen, setIsOpen] = useState(false)

  const handleOpenChange = useCallback(async (open: boolean) => {
    setIsOpen(open)
    if (open) {
      await fetchModels()
    }
  }, [fetchModels])

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 w-full rounded-md border border-border px-3 py-2 text-sm bg-card hover:bg-secondary/50 transition-colors cursor-pointer"
        >
          {selected && <ProviderIcon provider={selected.provider} size={14} />}
          <span className="flex-1 text-left text-foreground">
            {selected?.label ?? 'Select Model'}
          </span>
          {selected && (
            <span className="text-[10px] text-muted-foreground/60">
              {selected.description}
            </span>
          )}
          <ChevronDown size={12} className="text-muted-foreground/50" />
        </button>
      </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          sideOffset={4}
          className="z-[100] min-w-[280px] max-h-[300px] overflow-y-auto rounded-lg border border-border bg-card p-1 shadow-md animate-in fade-in-0 zoom-in-95"
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <AppInlineLoader message="Loading models…" size={16} />
            </div>
          ) : groups.length === 0 ? (
            <div className="flex items-center justify-center py-4 text-xs text-muted-foreground">
              No models available
            </div>
          ) : (
            groups.map((group) => (
              <DropdownMenuGroup key={group.provider}>
                <DropdownMenuLabel>
                  {group.label}
                </DropdownMenuLabel>
                {group.models.map((m) => {
                  const isSelected = selectedModelId === m.id

                  return (
                    <DropdownMenuItem
                      key={m.id}
                      onSelect={() => onModelChange(m.id)}
                      className={cn(
                        "flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[12px] cursor-pointer outline-none transition-colors",
                        isSelected
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-foreground/80 hover:bg-secondary",
                      )}
                    >
                      <ProviderIcon provider={m.provider} size={12} />
                      <span className="flex-1">{m.label}</span>
                      <span className="text-[10px] text-muted-foreground/50">
                        {m.description}
                      </span>
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuGroup>
            ))
          )}
        </DropdownMenuContent>
    </DropdownMenu>
  )
}
