import { useState } from 'react'
import { Search, Plus, FileText, Star, Trash2, Library, Pin, ChevronRight, ChevronDown, BookOpen, Folders, Zap, X } from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'

import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { IconButton } from '@/components/ui/icon-button'
import { Tooltip } from '@/components/Tooltip'
import { Tabs, TabsList, TabsTrigger } from '@/frameworks/right-panel/Tabs'
import { useNotesStore } from '@/store/notes-store'
import { useNotesAppStore, type SidebarView, type NotesSidebarSort } from '@/store/notes-app-store'
import { useNoteProjectsStore } from '@/store/note-projects-store'
import { useNoteNotebooksStore } from '@/store/note-notebooks-store'
import { useNoteLabelsStore } from '@/store/note-labels-store'

import { notesSidebarStyles as styles } from './NotesSidebar.styles'
import { resolveLabelColor } from './labelColors'
import { useNotesSidebarData } from './useNotesSidebarData'
import { NotesTreeNode } from './components/NotesTreeNode'
import { NotesSidebarModals } from './components/NotesSidebarModals'
import { useNotesSidebarModalsData } from './components/useNotesSidebarModalsData'
import { QuickActionsBar } from './components/QuickActionsBar'
import type { TreeNode } from './useNotesSidebarData'
import { DevicePickerDialog } from '@/components/ContentShare'
import type { ShareTarget } from '@/components/ContentShare/types'
import type { NotesShareKind } from '@/components/ContentShare/api'

const VIEW_TABS: Array<{ key: SidebarView; label: string; icon: React.ComponentType<{ size: number; className?: string }> }> = [
  { key: 'notebooks', label: 'All', icon: Library },
  { key: 'favorites', label: 'Starred', icon: Star },
  { key: 'trash', label: 'Trash', icon: Trash2 },
]

interface CollapsibleSectionProps {
  sectionKey: string
  label: string
  count: number
  icon: React.ComponentType<{ size: number; className?: string }>
  expandedNodeIds: string[]
  toggleNodeExpanded: (nodeId: string) => void
  children: React.ReactNode
}

/**
 * Sections are expanded by default (collapsed state requires an explicit entry
 * in expandedNodeIds prefixed with "collapsed::").
 */
function CollapsibleSection({
  sectionKey,
  label,
  count,
  icon: Icon,
  expandedNodeIds,
  toggleNodeExpanded,
  children,
}: CollapsibleSectionProps): React.JSX.Element {
  const collapsedKey = `collapsed::${sectionKey}`
  const isCollapsed = expandedNodeIds.includes(collapsedKey)
  const isOpen = !isCollapsed

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onClick={() => toggleNodeExpanded(collapsedKey)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            toggleNodeExpanded(collapsedKey)
          }
        }}
        className="group w-full flex items-center gap-1.5 h-7 pr-1.5 pl-1 rounded-md cursor-pointer hover:bg-muted/50 transition-colors duration-150 text-[12.5px] font-medium text-foreground/85"
      >
        <ChevronRight
          size={14}
          className={`shrink-0 text-muted-foreground/50 transition-transform duration-150 ${isOpen ? 'rotate-90' : ''}`}
        />
        <Icon size={14} className="shrink-0 text-muted-foreground/65" />
        <span className="truncate flex-1">{label}</span>
        <span className="ml-1 text-[10px] text-muted-foreground/40 tabular-nums">{count}</span>
      </div>
      {isOpen && <div className="flex flex-col gap-0.5">{children}</div>}
    </div>
  )
}

export function NotesSidebar(): React.JSX.Element {
  const {
    tree,
    projectTree,
    searchResults,
    labels,
    selectedLabelId,
    selectedNoteId,
    searchQuery,
    expandedNodeIds,
    setSelectedLabelId,
    setSelectedNoteId,
    setSearchQuery,
    toggleNodeExpanded,
    sidebarFilter,
    sidebarSort,
    setSidebarFilter,
    setSidebarSort,
    handleAddPage,
    favoriteNodes,
    pinnedNodes,
    trashedNodes,
  } = useNotesSidebarData()

  const [deletingLabelId, setDeletingLabelId] = useState<string | null>(null)
  const removeLabel = useNoteLabelsStore((s) => s.removeLabel)

  const sidebarView = useNotesAppStore((s) => s.sidebarView)
  const setSidebarView = useNotesAppStore((s) => s.setSidebarView)
  const restoreFromTrash = useNotesAppStore((s) => s.restoreFromTrash)
  const emptyTrash = useNotesAppStore((s) => s.emptyTrash)

  const {
    modalState,
    openModal,
    closeModal,
    handleSave,
    handleDelete,
    handleMove,
    notebooks,
    sections,
    topics,
    projects,
  } = useNotesSidebarModalsData()

  const toggleProjectFavorite = useNoteProjectsStore((s) => s.toggleProjectFavorite)
  const setProjectSortPreference = useNoteProjectsStore((s) => s.setProjectSortPreference)
  const setNotebookSortPreference = useNoteNotebooksStore((s) => s.setNotebookSortPreference)

  // ── Context menu callbacks ─────────────────────────────────────
  const handleRename = (node: TreeNode) => {
    const type =
      node.type === 'note' ? 'rename-note'
      : node.type === 'project' ? 'rename-project'
      : node.type === 'notebook' ? 'rename-notebook'
      : node.type === 'section' ? 'rename-section'
      : 'rename-topic'
    openModal(type, node)
  }

  const handleDuplicate = (node: TreeNode) => {
    if (node.type === 'note') {
      useNotesStore.getState().duplicateNote(node.id, 'notes-app', 'global', 'all')
    }
  }

  const handleMoveAction = (node: TreeNode) => {
    const type = node.type === 'note' ? 'move-note'
      : node.type === 'section' ? 'move-section'
        : 'move-topic'
    openModal(type, node)
  }

  const handleTogglePin = (node: TreeNode) => {
    useNotesStore.getState().togglePin(node.id, 'notes-app', 'global', 'all')
  }

  const handleToggleFavorite = (node: TreeNode) => {
    if (node.type === 'project') {
      toggleProjectFavorite(node.id)
      return
    }
    useNotesStore.getState().toggleFavorite(node.id, 'notes-app', 'global', 'all')
  }

  const handleMoveToProject = (node: TreeNode) => {
    if (node.type !== 'notebook') return
    openModal('move-notebook', node)
  }

  const handleTrash = (node: TreeNode) => {
    useNotesStore.getState().trashNote(node.id, 'notes-app', 'global', 'all')
  }

  const handleDeleteAction = (node: TreeNode) => {
    openModal('delete-confirm', node)
  }

  const handleAddNote = (node: TreeNode) => {
    if (node.type === 'notebook') handleAddPage(node.id, null, null)
    else if (node.type === 'section') handleAddPage(node.notebookId, node.id, null)
    else if (node.type === 'topic') handleAddPage(node.notebookId, node.sectionId, node.id)
    else if (node.type === 'unsorted') handleAddPage(null, null, null)
  }

  const handleAddSubgroup = (node: TreeNode) => {
    if (node.type === 'project') openModal('create-notebook', undefined, node.id)
    else if (node.type === 'notebook') openModal('create-section', undefined, node.id)
    else if (node.type === 'section') openModal('create-topic', undefined, node.id)
  }

  const handleRestore = (node: TreeNode) => {
    restoreFromTrash(node.id)
    useNotesStore.setState((s) => {
      const nextNotesByScope = { ...s.notesByScope }
      delete nextNotesByScope['notes-app::global::all']
      return { notesByScope: nextNotesByScope }
    })
    useNotesStore.getState().loadNotes('notes-app', 'global', 'all')
    useNotesAppStore.getState().loadTrashedNotes()
  }

  const handleDeletePermanently = (node: TreeNode) => {
    openModal('delete-confirm', node)
  }

  const handleSetSortPreference = (node: TreeNode, pref: NotesSidebarSort | null) => {
    if (node.type === 'project') setProjectSortPreference(node.id, pref)
    else if (node.type === 'notebook') setNotebookSortPreference(node.id, pref)
  }
  const [shareTarget, setShareTarget] = useState<ShareTarget | null>(null)

  const handleShare = (node: TreeNode) => {
    const NOTES_SHARE_KIND: Partial<Record<TreeNode['type'], NotesShareKind>> = {
      note: 'note',
      project: 'project',
      notebook: 'notebook',
      section: 'section',
      topic: 'topic',
    }
    const kind = NOTES_SHARE_KIND[node.type]
    if (!kind) return
    setShareTarget({ type: 'notes', kind, id: node.id, label: node.name })
  }
  // ── Render ───────────────────────────────────────────
  const contextMenuProps = {
    onRename: handleRename,
    onDuplicate: handleDuplicate,
    onMove: handleMoveAction,    onMoveToProject: handleMoveToProject,    onTogglePin: handleTogglePin,
    onToggleFavorite: handleToggleFavorite,
    onTrash: handleTrash,
    onDelete: handleDeleteAction,
    onAddNote: handleAddNote,
    onAddSubgroup: handleAddSubgroup,
    onShare: handleShare,
    onRestore: handleRestore,
    onDeletePermanently: handleDeletePermanently,
    onSetSortPreference: handleSetSortPreference,
  }

  return (
    <div className={styles.container}>
      {/* Header: title + create note/notebook */}
      <div className={styles.headerRow}>
        <span className={styles.headerTitle}>Notes</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={styles.headerCreateBtn}
              title="Create new…"
            >
              <Plus size={12} />
              New
              <ChevronDown size={10} className="ml-0.5 opacity-60" />
            </Button>
          </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={6}
              className="z-50 min-w-[150px] rounded-lg border border-border/40 bg-popover p-1 shadow-lg animate-in fade-in-0 zoom-in-95"
            >
              <DropdownMenuItem
                onSelect={() => handleAddPage()}
                className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[12px] text-foreground/85 cursor-pointer outline-none hover:bg-muted/60 focus:bg-muted/60 transition-colors"
              >
                <FileText size={13} className="text-muted-foreground/70" />
                New Note
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => openModal('create-notebook')}
                className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[12px] text-foreground/85 cursor-pointer outline-none hover:bg-muted/60 focus:bg-muted/60 transition-colors"
              >
                <BookOpen size={13} className="text-muted-foreground/70" />
                New Notebook
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => openModal('create-project')}
                className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[12px] text-foreground/85 cursor-pointer outline-none hover:bg-muted/60 focus:bg-muted/60 transition-colors"
              >
                <Folders size={13} className="text-muted-foreground/70" />
                New Project
              </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Search */}
      <div className={styles.searchContainer}>
        <div className="relative">
          <Search
            size={12}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/45"
          />
          <input
            type="text"
            placeholder="Search notes"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`${styles.searchInput} pl-7`}
          />
        </div>
      </div>

      {/* Segmented view switcher (pill style) */}
      <div className={styles.segmentedContainer}>
        <Tabs
          value={sidebarView}
          onValueChange={(v) => setSidebarView(v as SidebarView)}
        >
          <TabsList>
            {VIEW_TABS.map(({ key, label, icon: Icon }) => (
              <TabsTrigger key={key} value={key} icon={<Icon size={12} />}>
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Inline filter + sort (only for main notebooks view) */}
      {sidebarView === "notebooks" && (
        <QuickActionsBar
          filter={sidebarFilter}
          sort={sidebarSort}
          onFilterChange={setSidebarFilter}
          onSortChange={setSidebarSort}
        />
      )}

      <div className={styles.listContainer}>
        {/* ── Starred (Favorites) view ───────────────────────── */}
        {sidebarView === "favorites" && (
          <div>
            {favoriteNodes.length === 0 ? (
              <div className={styles.emptySection}>
                <Star size={18} className="text-muted-foreground/25" />
                <p>No starred notes</p>
              </div>
            ) : (
              <div className="flex flex-col gap-0.5 pt-1">
                {favoriteNodes.map((node) => (
                  <NotesTreeNode
                    key={node.nodeId}
                    node={node}
                    depth={0}
                    expandedNodeIds={expandedNodeIds}
                    toggleNodeExpanded={toggleNodeExpanded}
                    selectedNoteId={selectedNoteId}
                    onSelectNote={setSelectedNoteId}
                    onAddPage={handleAddPage}
                    contextMenuProps={contextMenuProps}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Trash view ──────────────────────────────────────── */}
        {sidebarView === "trash" && (
          <div>
            {trashedNodes.length > 0 && (
              <div className="flex items-center justify-end px-2 pt-2 pb-1">
                <Button
                  variant="link"
                  size="xs"
                  onClick={() => emptyTrash()}
                  className="text-[10px] text-destructive"
                >
                  Empty Trash
                </Button>
              </div>
            )}
            {trashedNodes.length === 0 ? (
              <div className={styles.emptySection}>
                <Trash2 size={18} className="text-muted-foreground/25" />
                <p>Trash is empty</p>
              </div>
            ) : (
              <div className="flex flex-col gap-0.5">
                {trashedNodes.map((node) => (
                  <NotesTreeNode
                    key={node.nodeId}
                    node={node}
                    depth={0}
                    expandedNodeIds={expandedNodeIds}
                    toggleNodeExpanded={toggleNodeExpanded}
                    selectedNoteId={selectedNoteId}
                    onSelectNote={setSelectedNoteId}
                    onAddPage={handleAddPage}
                    contextMenuProps={contextMenuProps}
                    isTrashed
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Main notebooks / search view ─────────────────── */}
        {sidebarView === "notebooks" && (
          <>
            {searchResults ? (
              <div className="pt-1">
                {searchResults.length === 0 ? (
                  <div className={styles.emptySection}>
                    <FileText size={18} className="text-muted-foreground/25" />
                    <p>No matching notes</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-0.5">
                    {searchResults.map((node) => (
                      <NotesTreeNode
                        key={node.nodeId}
                        node={node}
                        depth={0}
                        expandedNodeIds={expandedNodeIds}
                        toggleNodeExpanded={toggleNodeExpanded}
                        selectedNoteId={selectedNoteId}
                        onSelectNote={setSelectedNoteId}
                        onAddPage={handleAddPage}
                        contextMenuProps={contextMenuProps}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div>
                {/* Pinned section — always visible */}
                <CollapsibleSection
                  sectionKey="section::pinned"
                  label="Pinned"
                  count={pinnedNodes.length}
                  icon={Pin}
                  expandedNodeIds={expandedNodeIds}
                  toggleNodeExpanded={toggleNodeExpanded}
                >
                  {pinnedNodes.length === 0 ? (
                    <div className="py-4 text-center text-[11px] text-muted-foreground/25">
                      No pinned notes
                    </div>
                  ) : (
                    pinnedNodes.map((node) => (
                      <NotesTreeNode
                        key={`pinned-${node.nodeId}`}
                        node={node}
                        depth={0}
                        expandedNodeIds={expandedNodeIds}
                        toggleNodeExpanded={toggleNodeExpanded}
                        selectedNoteId={selectedNoteId}
                        onSelectNote={setSelectedNoteId}
                        onAddPage={handleAddPage}
                        contextMenuProps={contextMenuProps}
                      />
                    ))
                  )}
                </CollapsibleSection>

                {/* Starred section */}
                {favoriteNodes.length > 0 && (
                  <CollapsibleSection
                    sectionKey="section::starred"
                    label="Starred"
                    count={favoriteNodes.length}
                    icon={Star}
                    expandedNodeIds={expandedNodeIds}
                    toggleNodeExpanded={toggleNodeExpanded}
                  >
                    {favoriteNodes.map((node) => (
                      <NotesTreeNode
                        key={`starred-${node.nodeId}`}
                        node={node}
                        depth={0}
                        expandedNodeIds={expandedNodeIds}
                        toggleNodeExpanded={toggleNodeExpanded}
                        selectedNoteId={selectedNoteId}
                        onSelectNote={setSelectedNoteId}
                        onAddPage={handleAddPage}
                        contextMenuProps={contextMenuProps}
                      />
                    ))}
                  </CollapsibleSection>
                )}

                {/* Notebooks section */}
                {tree.length === 0
                  ? pinnedNodes.length === 0 &&
                    favoriteNodes.length === 0 && (
                      <div className={styles.emptySection}>
                        <FileText
                          size={18}
                          className="text-muted-foreground/25"
                        />
                        <p>No notes yet</p>
                        <Button
                          variant="link"
                          size="xs"
                          onClick={() => handleAddPage()}
                          className="mt-1 text-[11px]"
                        >
                          Create your first note
                        </Button>
                      </div>
                    )
                  : (() => {
                      const systemNodes = tree.filter(
                        (n) => n.type === "notebook" && n.isSystem,
                      );
                      // Notebooks that belong to a project render *inside* that
                      // project node — exclude them from the flat "All
                      // Notebooks" list so they aren't drawn twice.
                      const otherNodes = tree.filter(
                        (n) =>
                          !(n.type === "notebook" && n.isSystem) &&
                          !(n.type === "notebook" && n.projectId),
                      );

                      // Collect all note children from system notebooks (QuickNote)
                      const quickNoteChildren = systemNodes.flatMap(
                        (n) => n.children,
                      );
                      const quickNoteCount = systemNodes.reduce(
                        (sum, n) => sum + n.count,
                        0,
                      );

                      return (
                        <div className="flex flex-col gap-0.5">
                          {/* QuickNote section — always visible */}
                          <CollapsibleSection
                            sectionKey="section::quicknote"
                            label="QuickNote"
                            count={quickNoteCount}
                            icon={Zap}
                            expandedNodeIds={expandedNodeIds}
                            toggleNodeExpanded={toggleNodeExpanded}
                          >
                            {quickNoteChildren.length === 0 ? (
                              <div className="py-4 text-center text-[11px] text-muted-foreground/25">
                                No quick notes
                              </div>
                            ) : (
                              quickNoteChildren.map((node) => (
                                <NotesTreeNode
                                  key={`quick-${node.nodeId}`}
                                  node={node}
                                  depth={0}
                                  expandedNodeIds={expandedNodeIds}
                                  toggleNodeExpanded={toggleNodeExpanded}
                                  selectedNoteId={selectedNoteId}
                                  onSelectNote={setSelectedNoteId}
                                  onAddPage={handleAddPage}
                                  contextMenuProps={contextMenuProps}
                                />
                              ))
                            )}
                          </CollapsibleSection>

                          {/* Projects section — render projects with their notebooks */}
                          {projectTree.length > 0 && (
                            <>
                              <div className={styles.sectionHeader}>
                                <span>Projects</span>
                                <IconButton
                                  variant="ghost"
                                  size="xs"
                                  onClick={() => openModal("create-project")}
                                  className={styles.sectionHeaderButton}
                                  tooltip="New project"
                                >
                                  <Plus size={12} />
                                </IconButton>
                              </div>
                              {projectTree.map((node) => (
                                <NotesTreeNode
                                  key={node.nodeId}
                                  node={node}
                                  depth={0}
                                  expandedNodeIds={expandedNodeIds}
                                  toggleNodeExpanded={toggleNodeExpanded}
                                  selectedNoteId={selectedNoteId}
                                  onSelectNote={setSelectedNoteId}
                                  onAddPage={handleAddPage}
                                  contextMenuProps={contextMenuProps}
                                />
                              ))}
                            </>
                          )}

                          {otherNodes.length > 0 && (
                            <div className={styles.sectionHeader}>
                              <span>All Notebooks</span>
                              <IconButton
                                variant="ghost"
                                size="xs"
                                onClick={() => openModal("create-notebook")}
                                className={styles.sectionHeaderButton}
                                tooltip="New notebook"
                              >
                                <Plus size={12} />
                              </IconButton>
                            </div>
                          )}

                          {otherNodes.map((node) => (
                            <NotesTreeNode
                              key={node.nodeId}
                              node={node}
                              depth={0}
                              expandedNodeIds={expandedNodeIds}
                              toggleNodeExpanded={toggleNodeExpanded}
                              selectedNoteId={selectedNoteId}
                              onSelectNote={setSelectedNoteId}
                              onAddPage={handleAddPage}
                              contextMenuProps={contextMenuProps}
                            />
                          ))}
                        </div>
                      );
                    })()}
              </div>
            )}

            {/* LABELS */}
            {(labels.length > 0 || selectedLabelId) && (
              <div className="mt-2">
                <div className={styles.sectionDivider} />
                <div className={styles.sectionHeader}>
                  <span>Labels</span>
                  <IconButton
                    variant="ghost"
                    size="xs"
                    onClick={() => openModal("create-label")}
                    className={styles.sectionHeaderButton}
                    tooltip="Add label"
                  >
                    <Plus size={12} />
                  </IconButton>
                </div>
                <div className={styles.labelBar}>
                  {labels.map((label) => {
                    const isActive = selectedLabelId === label.id;
                    const color = resolveLabelColor(label);
                    return (
                      <div key={label.id} className="group/label relative">
                        <button
                          onClick={() =>
                            setSelectedLabelId(isActive ? null : label.id)
                          }
                          className={
                            isActive ? styles.labelBadgeActive : styles.labelBadge
                          }
                          style={{
                            color,
                            backgroundColor: `${color}${isActive ? '2e' : '1a'}`,
                            borderColor: `${color}${isActive ? '5c' : '33'}`,
                          }}
                        >
                          <span className="opacity-50">#</span>
                          {label.name}
                        </button>
                        <Tooltip content="Delete label" side="top">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeletingLabelId(label.id);
                            }}
                            className="absolute -top-1.5 -right-1.5 hidden group-hover/label:flex items-center justify-center w-3.5 h-3.5 rounded-full bg-destructive text-destructive-foreground cursor-pointer"
                          >
                            <X size={8} />
                          </button>
                        </Tooltip>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {labels.length === 0 && !selectedLabelId && (
              <div className="mt-3 px-3">
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => openModal("create-label")}
                  className="text-[10px] text-muted-foreground/50"
                >
                  + Add label
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Label delete confirmation */}
      <AlertDialog open={!!deletingLabelId} onOpenChange={(open) => { if (!open) setDeletingLabelId(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete label</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>"#{labels.find((l) => l.id === deletingLabelId)?.name}"</strong>? It will be removed from all notes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingLabelId) {
                  removeLabel(deletingLabelId)
                  if (selectedLabelId === deletingLabelId) setSelectedLabelId(null)
                }
                setDeletingLabelId(null)
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modals */}
      <NotesSidebarModals
        modalState={modalState}
        onClose={closeModal}
        onSave={handleSave}
        onDelete={handleDelete}
        onMove={handleMove}
        notebooks={notebooks}
        sections={sections}
        topics={topics}
        projects={projects}
      />
      <DevicePickerDialog
        open={shareTarget !== null}
        onOpenChange={(o) => {
          if (!o) setShareTarget(null)
        }}
        target={shareTarget}
      />
    </div>
  );
}
