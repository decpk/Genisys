import { Globe, ClipboardPaste, FolderInput, RefreshCw, AlertCircle } from 'lucide-react'
import { AppInlineLoader } from '@/components/AppLoader'
import { PanelHeading } from '@/components/ui/panel-heading'
import { SearchInput } from '@/components/ui/search-input'
import { EmptyState } from '@/components/ui/empty-state'
import { Tooltip } from '@/components/Tooltip/Tooltip'
import { CollectionItem } from '../CollectionItem'
import { APIClientSortSwitcher } from '../APIClientSortSwitcher'
import { CollectionsPanelAddMenu } from '../components/CollectionsPanelAddMenu'
import { useAPIClientSidebarData } from '../useAPIClientSidebarData'
import { useDeleteApiRequest } from '../useDeleteApiRequest'
import { NewCollectionDialog } from '../../NewCollectionDialog/NewCollectionDialog'
import { NewFolderDialog } from '../../NewFolderDialog/NewFolderDialog'
import { ImportDialog } from '../../ImportDialog/ImportDialog'
import { ImportCollectionDialog } from '../../ImportCollectionDialog'
import { NewRequestDialog } from '../../NewRequestDialog/NewRequestDialog'
import { RequestAnalyticsModal } from '../../RequestAnalyticsModal'
import { useConfirmDialogStore } from '@/store/confirm-dialog-store'

export function CollectionsPanel(): React.JSX.Element {
  const data = useAPIClientSidebarData()
  const openConfirmDialog = useConfirmDialogStore((s) => s.openConfirmDialog)
  const deleteRequest = useDeleteApiRequest()

  return (
    <div className="flex flex-col h-full">
      <PanelHeading icon={Globe} title="API Client" count={data.collections.length}>
        <Tooltip content="Refresh" side="bottom">
          <button
            onClick={() => data.reload()}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <RefreshCw size={14} className={data.isLoading ? 'animate-spin' : ''} />
          </button>
        </Tooltip>
        <Tooltip content="Import" side="bottom">
          <button
            onClick={() => data.setShowImport(true)}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <ClipboardPaste size={14} />
          </button>
        </Tooltip>
        <Tooltip content="Import Collection" side="bottom">
          <button
            onClick={() => data.setShowImportCollection(true)}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <FolderInput size={14} />
          </button>
        </Tooltip>
        <CollectionsPanelAddMenu
          onNewRequest={data.handleNewRequestQuick}
          onNewCollection={() => data.setShowNewCollection(true)}
        />
      </PanelHeading>

      <div className="px-2.5 pt-2 pb-1.5">
        <SearchInput placeholder="Search requests..." value={data.filter} onChange={data.setFilter} />
      </div>

      <div className="flex items-center justify-between px-2.5 pb-1.5">
        <span className="text-2xs uppercase tracking-wider text-muted-foreground/40 font-medium">Collections</span>
        <APIClientSortSwitcher sort={data.sort} onSortChange={data.onSortChange} />
      </div>

      <div className="h-px bg-border/20 mx-2.5" />

      <div className="flex-1 overflow-y-auto px-1.5 py-1.5">
        {data.isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <AppInlineLoader message="Loading collections..." size={24} className="flex-col" />
          </div>
        ) : data.error ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
            <AlertCircle size={24} className="text-destructive/60" />
            <span className="text-xs text-center px-4">Failed to load collections</span>
            <button
              onClick={() => data.reload()}
              className="text-xs text-primary hover:underline mt-1"
            >
              Retry
            </button>
          </div>
        ) : data.collections.length === 0 ? (
          <EmptyState icon={Globe} message="No collections yet" />
        ) : (
          data.collections.map((collection) => {
            const collFolders = data.allFolders.filter((f) => f.collectionId === collection.id)
            const collRequests = data.allRequests.filter((r) => r.collectionId === collection.id)
            return (
              <CollectionItem
                key={collection.id}
                collection={collection}
                folders={collFolders}
                requests={collRequests}
                activeRequestId={data.activeRequestId}
                sort={data.sort}
                onSelectRequest={data.setActiveRequestId}
                onAddRequest={(folderId) => data.handleAddRequest(collection.id, folderId)}
                onAddFolder={() => data.handleAddFolder(collection.id)}
                onRemoveCollection={() =>
                  openConfirmDialog({
                    title: 'Delete collection',
                    description: `Are you sure you want to delete "${collection.name}"? All folders and requests inside will be permanently removed. This action cannot be undone.`,
                    onConfirm: () => data.removeCollection(collection.id),
                  })
                }
                onRemoveFolder={(folderId) =>
                  openConfirmDialog({
                    title: 'Delete folder',
                    description: 'Are you sure you want to delete this folder and all its requests? This action cannot be undone.',
                    onConfirm: () => data.removeFolder(folderId),
                  })
                }
                onUpdateCollection={data.updateCollection}
                onUpdateFolder={data.updateFolder}
                onUpdateRequest={data.updateRequest}
                onDuplicateRequest={data.handleDuplicateRequest}
                onExportCollection={data.handleExportCollection}
                onExportRequest={data.handleExportRequest}
                onViewAnalyticsRequest={data.openAnalytics}
                onDeleteRequest={deleteRequest}
              />
            )
          })
        )}
      </div>

      <NewCollectionDialog
        open={data.showNewCollection}
        onOpenChange={data.setShowNewCollection}
      />
      <NewFolderDialog
        open={data.showNewFolder}
        onOpenChange={data.setShowNewFolder}
        collectionId={data.newFolderCollectionId}
      />
      <ImportDialog
        open={data.showImport}
        onOpenChange={data.setShowImport}
        collections={data.collections}
      />
      <ImportCollectionDialog
        open={data.showImportCollection}
        onOpenChange={data.setShowImportCollection}
      />
      <NewRequestDialog
        open={data.showNewRequest}
        onOpenChange={data.setShowNewRequest}
        collectionId={data.newRequestCollectionId}
        folderId={data.newRequestFolderId}
      />
      <RequestAnalyticsModal
        open={data.analyticsRequestId !== null}
        onOpenChange={data.closeAnalytics}
        requestId={data.analyticsRequestId}
      />
    </div>
  )
}
