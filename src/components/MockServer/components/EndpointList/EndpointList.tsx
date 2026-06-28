import { useState } from 'react'
import { Plus, Unplug } from 'lucide-react'

import { EndpointItem } from './EndpointItem'
import { useEndpointListData } from './useEndpointListData'
import { CreateEndpointDialog } from '../CreateEndpointDialog'

export function EndpointList() {
  const {
    endpoints,
    selectedEndpointId,
    handleDeleteEndpoint,
    handleSelectEndpoint,
    handleDuplicateEndpoint,
    handleToggleActive,
  } = useEndpointListData()

  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const isEmpty = endpoints.length === 0

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Endpoints
          </h3>
          {!isEmpty && (
            <span className="rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
              {endpoints.length}
            </span>
          )}
        </div>
        <button
          onClick={() => setShowCreateDialog(true)}
          className="inline-flex h-7 items-center gap-1.5 rounded-md bg-primary/10 px-2.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Endpoint
        </button>
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted/40">
            <Unplug className="h-6 w-6 opacity-50" />
          </div>
          <div className="flex flex-col items-center gap-1">
            <p className="text-sm font-medium text-foreground/70">No endpoints yet</p>
            <button
              onClick={() => setShowCreateDialog(true)}
              className="text-xs text-primary hover:underline"
            >
              Add your first endpoint
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-1 px-3 pb-3">
          {endpoints.map((ep) => (
            <EndpointItem
              key={ep.id}
              endpoint={ep}
              isSelected={ep.id === selectedEndpointId}
              onSelect={handleSelectEndpoint}
              onDelete={handleDeleteEndpoint}
              onDuplicate={handleDuplicateEndpoint}
              onToggleActive={handleToggleActive}
            />
          ))}
        </div>
      )}

      <CreateEndpointDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </div>
  )
}
