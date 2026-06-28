import { useState, useRef, useEffect } from 'react'
import { Plus, ChevronDown, Sparkles } from 'lucide-react'

import { cn } from '@/lib/utils'
import { IconButton } from '@/components/ui/icon-button'
import { Dropdown } from '@/components/ui/dropdown'
import type { DropdownItem } from '@/components/ui/dropdown'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { EndpointTab } from './EndpointTab'
import { useEndpointTabBarData } from './useEndpointTabBarData'
import { CreateEndpointDialog } from '../CreateEndpointDialog'

const METHOD_DOT_COLORS: Record<string, string> = {
  GET: 'bg-emerald-500',
  POST: 'bg-blue-500',
  PUT: 'bg-amber-500',
  PATCH: 'bg-yellow-500',
  DELETE: 'bg-red-500',
  OPTIONS: 'bg-purple-500',
  HEAD: 'bg-gray-400',
}

export function EndpointTabBar() {
  const {
    tabEndpoints,
    hiddenEndpoints,
    activeEndpointTabId,
    pendingCloseTabId,
    pendingCloseEndpoint,
    confirmCloseEndpointTab,
    cancelCloseEndpointTab,
    handleActivate,
    handleClose,
    handleCloseOthers,
    handleCloseAll,
    handleReopen,
    handleDelete,
    handleDuplicate,
  } = useEndpointTabBarData()

  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleCreateEndpoint = () => setShowCreateDialog(true)
    window.addEventListener('mockserver:create-endpoint', handleCreateEndpoint)
    return () =>
      window.removeEventListener('mockserver:create-endpoint', handleCreateEndpoint)
  }, [])

  const overflowItems: DropdownItem[] = hiddenEndpoints.map((ep) => ({
    key: ep.id,
    label: `${ep.method} ${ep.path}`,
    prefix: (
      <span
        className={cn(
          'inline-block size-2 rounded-full',
          METHOD_DOT_COLORS[ep.method] ?? 'bg-gray-400'
        )}
      />
    ),
    suffix: ep.response_type === 'ai' ? (
      <Sparkles className="h-2.5 w-2.5 text-indigo-400" />
    ) : undefined,
    onSelect: () => handleReopen(ep.id),
  }))

  return (
    <>
      <div className="flex items-center border-b border-border/40 bg-muted/30">
        {/* Scrollable tab area */}
        <div
          ref={scrollRef}
          className="flex flex-1 items-center overflow-x-auto scrollbar-none"
        >
          {tabEndpoints.map((ep) => (
            <EndpointTab
              key={ep.id}
              endpoint={ep}
              isActive={ep.id === activeEndpointTabId}
              onActivate={handleActivate}
              onClose={handleClose}
              onCloseOthers={handleCloseOthers}
              onCloseAll={handleCloseAll}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
            />
          ))}
        </div>

        {/* Actions: overflow dropdown + add button */}
        <div className="flex shrink-0 items-center gap-0.5 border-l border-border/40 px-1.5">
          {hiddenEndpoints.length > 0 && (
            <Dropdown
              items={overflowItems}
              openOn="click"
              align="right"
              menuWidth="220px"
              trigger={
                <IconButton
                  variant="ghost"
                  size="sm"
                  tooltip={`${hiddenEndpoints.length} more endpoint${hiddenEndpoints.length > 1 ? 's' : ''}`}
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </IconButton>
              }
            />
          )}
          <IconButton
            variant="ghost"
            size="sm"
            tooltip="New endpoint"
            onClick={() => setShowCreateDialog(true)}
          >
            <Plus className="h-3.5 w-3.5" />
          </IconButton>
        </div>
      </div>

      <CreateEndpointDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />

      <AlertDialog
        open={pendingCloseTabId !== null}
        onOpenChange={(open) => {
          if (!open) cancelCloseEndpointTab()
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Close tab</AlertDialogTitle>
            <AlertDialogDescription>
              Close{' '}
              <span className="font-medium">
                {pendingCloseEndpoint
                  ? `${pendingCloseEndpoint.method} ${pendingCloseEndpoint.path}`
                  : 'this endpoint tab'}
              </span>
              ? If the server is running, it will be stopped.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => confirmCloseEndpointTab()}>
              Close
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
