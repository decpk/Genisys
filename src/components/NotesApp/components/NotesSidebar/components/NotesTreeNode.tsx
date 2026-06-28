import { ChevronRight, BookOpen, BookMarked, FolderOpen, Folders, FileText, Pin, Plus, Star, Zap, Inbox } from 'lucide-react'
import { useScrollIntoViewOnActive } from '@/hooks/useScrollIntoViewOnActive'

import { notesSidebarStyles as styles } from '../NotesSidebar.styles'
import { IconButton } from '@/components/ui/icon-button'
import { setNoteDragData } from '@/components/NotesApp/notes-drag'
import type { NotesSidebarSort } from '@/store/notes-app-store'
import type { TreeNode } from '../useNotesSidebarData'
import { NotePickerPopover } from './NotePickerPopover'
import { NotesTreeContextMenu } from './NotesTreeContextMenu'

interface ContextMenuCallbacks {
  onRename: (node: TreeNode) => void
  onDuplicate: (node: TreeNode) => void
  onMove: (node: TreeNode) => void
  onMoveToProject?: (node: TreeNode) => void
  onTogglePin: (node: TreeNode) => void
  onToggleFavorite: (node: TreeNode) => void
  onTrash: (node: TreeNode) => void
  onDelete: (node: TreeNode) => void
  onAddNote: (node: TreeNode) => void
  onAddSubgroup: (node: TreeNode) => void
  onShare: (node: TreeNode) => void
  onRestore?: (node: TreeNode) => void
  onDeletePermanently?: (node: TreeNode) => void
  onSetSortPreference?: (node: TreeNode, sortPreference: NotesSidebarSort | null) => void
}

interface NotesTreeNodeProps {
  node: TreeNode
  depth: number
  isLast?: boolean
  ancestorIsLast?: boolean[]
  isInsideExpandedGroup?: boolean
  expandedNodeIds: string[]
  toggleNodeExpanded: (nodeId: string) => void
  selectedNoteId: string | null
  onSelectNote: (id: string) => void
  onAddPage: (notebookId?: string | null, sectionId?: string | null, topicId?: string | null) => void
  contextMenuProps?: ContextMenuCallbacks
  isTrashed?: boolean
}

const ICON_SIZE = 14

function getFolderIcon(node: TreeNode) {
  switch (node.type) {
    case 'project':
      return Folders
    case 'notebook':
      return node.isSystem ? Zap : BookOpen
    case 'section':
      return BookMarked
    case 'topic':
      return FolderOpen
    case 'unsorted':
      return Inbox
    default:
      return FileText
  }
}

function RailSVG() {
  // Compact indent spacer (no vertical line, cleaner look)
  return <div className={styles.treeRail} />
}

// Depth-based typography: slightly stronger at root, lighter deeper in tree
function getGroupRowClass(depth: number): string {
  const base = "group w-full flex items-center gap-1.5 h-7 pr-1.5 pl-1 rounded-md cursor-pointer hover:bg-muted/50 transition-colors duration-150"
  if (depth === 0) return `${base} text-[12.5px] font-medium text-foreground/85`
  if (depth === 1) return `${base} text-[12px] font-medium text-foreground/70`
  return `${base} text-[12px] font-normal text-muted-foreground/70`
}

function getNoteRowClass(depth: number, isActive: boolean): string {
  const base = "group w-full flex items-center gap-1.5 h-7 pr-1.5 pl-1 rounded-md cursor-pointer transition-colors duration-150"
  const size = "text-[12.5px]"
  if (isActive) return `${base} ${size} bg-primary/10 border border-primary/30 text-primary font-medium`
  const color = depth <= 1 ? "text-muted-foreground/75" : "text-muted-foreground/65"
  return `${base} ${size} border border-transparent hover:bg-secondary ${color}`
}

/** Renders leading spacer rails to create indentation at the given depth. */
function TreeRails({ depth }: { depth: number }): React.JSX.Element | null {
  if (depth === 0) return null
  const rails: React.ReactNode[] = []
  for (let i = 0; i < depth; i++) {
    rails.push(<RailSVG key={i} />);
  }
  return <>{rails}</>
}

export function NotesTreeNode({
  node,
  depth,
  isLast = false,
  ancestorIsLast = [],
  isInsideExpandedGroup = false,
  expandedNodeIds,
  toggleNodeExpanded,
  selectedNoteId,
  onSelectNote,
  onAddPage,
  contextMenuProps,
  isTrashed = false,
}: NotesTreeNodeProps): React.JSX.Element {
  const isNote = node.type === 'note'
  const isExpanded = expandedNodeIds.includes(node.nodeId)
  const isActive = isNote && selectedNoteId === node.id
  const hasChildren = node.children.length > 0
  const noteRowRef = useScrollIntoViewOnActive<HTMLDivElement>(isActive)

  const handleClick = () => {
    if (isNote) {
      onSelectNote(node.id)
    } else {
      toggleNodeExpanded(node.nodeId)
    }
  }

  const handleAddChild = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (contextMenuProps) {
      contextMenuProps.onAddNote(node)
    } else {
      if (node.type === 'notebook') onAddPage(node.id, null, null)
      else if (node.type === 'section') onAddPage(node.notebookId, node.id, null)
      else if (node.type === 'topic') onAddPage(node.notebookId, node.sectionId, node.id)
      else if (node.type === 'unsorted') onAddPage(null, null, null)
    }
  }

  const handleAddSubgroup = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (contextMenuProps) {
      contextMenuProps.onAddSubgroup(node)
    }
  }

  // Icon slot: emoji > color-dot/tint > default lucide icon
  const renderIconSlot = () => {
    if (node.emoji) {
      return <span className={styles.treeEmoji}>{node.emoji}</span>
    }
    if (isNote) {
      if (node.color) {
        return (
          <span className={styles.treeIconSlot}>
            <span className={styles.treeLeafDot} style={{ backgroundColor: node.color }} />
          </span>
        )
      }
      return (
        <span className={styles.treeIconSlot}>
          <span
            className={styles.treeLeafDot}
            style={{ backgroundColor: 'var(--color-muted-foreground)', opacity: 0.35 }}
          />
        </span>
      )
    }
    const Icon = getFolderIcon(node)
    const iconClass = isActive ? styles.treeNodeIconActive : styles.treeNodeIcon
    if (node.color) {
      return <Icon size={ICON_SIZE} className="shrink-0" style={{ color: node.color }} />
    }
    return <Icon size={ICON_SIZE} className={iconClass} />
  }

  const rails = <TreeRails depth={depth} />;

  // Note leaf node
  if (isNote) {
    const noteContent = (
      <div
        ref={noteRowRef}
        draggable
        onDragStart={(e) => setNoteDragData(e, node.id)}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick();
          }
        }}
        className={getNoteRowClass(depth, isActive)}
      >
        {rails}
        <div className={styles.treeExpandPlaceholder} />
        <NotePickerPopover node={node}>{renderIconSlot()}</NotePickerPopover>
        <span className={styles.treeNodeLabel}>{node.name}</span>
        {node.isFavorite && (
          <Star
            size={10}
            className="text-amber-400/70 shrink-0 fill-amber-400/70"
          />
        )}
        {node.isPinned && <Pin size={10} className={styles.treeNotePin} />}
      </div>
    );

    if (contextMenuProps) {
      return (
        <NotesTreeContextMenu
          node={node}
          isTrashed={isTrashed}
          {...contextMenuProps}
        >
          {noteContent}
        </NotesTreeContextMenu>
      )
    }
    return noteContent
  }

  // No group wrapper in the simplified design — flat tree
  const shouldWrapGroup = false

  const row = (
    <div
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
      className={getGroupRowClass(depth)}
    >
      {rails}
      {hasChildren ? (
        <ChevronRight
          size={14}
          className={`${styles.treeExpandIcon} ${isExpanded ? styles.treeExpandIconOpen : ""}`}
        />
      ) : (
        <div className={styles.treeExpandPlaceholder} />
      )}
      <NotePickerPopover node={node}>{renderIconSlot()}</NotePickerPopover>
      <span className={styles.treeNodeLabel}>{node.name}</span>

      {node.type === "project" && node.isFavorite && (
        <Star
          size={10}
          className="text-amber-400/70 shrink-0 fill-amber-400/70"
        />
      )}

      {(node.type === "project" || node.type === "notebook" || node.type === "section") && (
        <IconButton
          variant="ghost"
          size="xs"
          onClick={handleAddSubgroup}
          className={styles.treeAddButton}
          tooltip={
            node.type === "project"
              ? "Add notebook"
              : node.type === "notebook"
                ? "Add section"
                : "Add topic"
          }
        >
          <Plus size={12} />
        </IconButton>
      )}

      {node.type !== "project" && (
        <IconButton
          variant="ghost"
          size="xs"
          onClick={handleAddChild}
          className={styles.treeAddButton}
          tooltip="Add page"
        >
          <FileText size={12} />
        </IconButton>
      )}

      <span className={node.count > 0 ? styles.treeNodeCount : ""}>
        {node.count > 0 ? node.count : ""}
      </span>
    </div>
  );

  const children =
    isExpanded && hasChildren ? (
      <div>
        {node.children.map((child, i) => (
          <NotesTreeNode
            key={child.nodeId}
            node={child}
            depth={depth + 1}
            isLast={i === node.children.length - 1}
            ancestorIsLast={[...ancestorIsLast, isLast]}
            isInsideExpandedGroup={isInsideExpandedGroup || shouldWrapGroup}
            expandedNodeIds={expandedNodeIds}
            toggleNodeExpanded={toggleNodeExpanded}
            selectedNoteId={selectedNoteId}
            onSelectNote={onSelectNote}
            onAddPage={onAddPage}
            contextMenuProps={contextMenuProps}
            isTrashed={isTrashed}
          />
        ))}
      </div>
    ) : null

  const wrappedRow = contextMenuProps ? (
    <NotesTreeContextMenu node={node} {...contextMenuProps}>
      {row}
    </NotesTreeContextMenu>
  ) : row

  return (
    <div>
      {wrappedRow}
      {children}
    </div>
  );
}
