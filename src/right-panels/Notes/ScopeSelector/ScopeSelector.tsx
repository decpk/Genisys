import { ChevronDown, Check } from 'lucide-react'
import { Popover as PopoverPrimitive } from 'radix-ui'

import { scopeSelectorStyles } from '../Notes.styles'
import { useScopeSelectorData } from './useScopeSelectorData'
import type { ScopeSelectorProps } from './ScopeSelector.types'

export function ScopeSelector(props: ScopeSelectorProps): React.JSX.Element {
  const { scopes, activeScope, onScopeChange } = props
  const { isOpen, setIsOpen, handleSelect } = useScopeSelectorData(onScopeChange)

  return (
    <PopoverPrimitive.Root open={isOpen} onOpenChange={setIsOpen}>
      <PopoverPrimitive.Trigger className={scopeSelectorStyles.trigger}>
        <span className={scopeSelectorStyles.triggerLabel}>{activeScope.label}</span>
        <ChevronDown size={12} className="shrink-0 text-muted-foreground/50" />
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={4}
          className="z-50 min-w-[180px] rounded-xl border border-border/60 bg-card p-1 shadow-lg animate-in fade-in-0 zoom-in-95"
        >
          {scopes.map((scope) => {
            const Icon = scope.icon
            const isActive = scope.type === activeScope.type && scope.id === activeScope.id
            return (
              <button
                key={`${scope.type}-${scope.id}`}
                onClick={() => handleSelect(scope)}
                className={`flex items-center gap-2 w-full rounded-lg px-2.5 py-1.5 text-left text-[12px] transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-foreground hover:bg-secondary/60'
                }`}
              >
                {Icon && (
                  <Icon
                    size={13}
                    className={`shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
                  />
                )}
                <span className="flex-1 truncate">{scope.label}</span>
                {isActive && <Check size={12} className="shrink-0 text-primary" />}
              </button>
            )
          })}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}
