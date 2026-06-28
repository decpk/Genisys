import { memo } from 'react'
import { Database } from 'lucide-react'

import { PanelHeading } from '@/components/ui/panel-heading'
import { SearchInput } from '@/components/ui/search-input'
import type { StoreRegistryEntry } from '@/store/registry'

interface StoreSidebarProps {
  stores: readonly StoreRegistryEntry[]
  selectedName: string | null
  onSelect: (name: string) => void
  searchQuery: string
  onSearchChange: (q: string) => void
}

export const StoreSidebar = memo(function StoreSidebar({
  stores,
  selectedName,
  onSelect,
  searchQuery,
  onSearchChange,
}: StoreSidebarProps): React.JSX.Element {
  const filtered = searchQuery
    ? stores.filter((s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : stores

  return (
    <div className="h-full flex flex-col">
      <PanelHeading icon={Database} title="Stores" count={stores.length} className="px-3 h-12 border-b border-border/40" />

      <div className="px-2.5 py-2">
        <SearchInput
          placeholder="Filter stores..."
          value={searchQuery}
          onChange={onSearchChange}
        />
      </div>

      <div className="flex-1 overflow-y-auto px-1.5 pb-2">
        <div className="flex flex-col gap-0.5">
          {filtered.map((store) => {
            const isSelected = store.name === selectedName
            const stateKeyCount = Object.keys(store.api.getState()).filter(
              (k) => typeof store.api.getState()[k] !== 'function'
            ).length

            return (
              <button
                key={store.name}
                onClick={() => onSelect(store.name)}
                className={`w-full text-left rounded-md px-2 py-2 transition-colors cursor-pointer group ${
                  isSelected
                    ? 'bg-primary/10 border border-primary/30'
                    : 'border border-transparent hover:bg-secondary'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium truncate">{store.name}</span>
                  <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
                  {stateKeyCount} keys
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                {store.description}
              </p>
            </button>
          )
        })}
        </div>
      </div>
    </div>
  )
})
