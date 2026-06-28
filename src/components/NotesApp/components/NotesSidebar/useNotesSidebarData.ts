import { useMemo, useCallback } from 'react'

import {
  useNotesAppStore,
  type NotesSidebarFilter,
  type NotesSidebarSort,
} from '@/store/notes-app-store'
import { useNoteNotebooksStore } from '@/store/note-notebooks-store'
import { useNoteSectionsStore } from '@/store/note-sections-store'
import { useNoteTopicsStore } from '@/store/note-topics-store'
import { useNoteProjectsStore } from '@/store/note-projects-store'
import { useNoteLabelsStore } from '@/store/note-labels-store'
import { useNotesStore, type Note } from '@/store/notes-store'
import { useSettingsStore } from '@/store/settings-store'

const EMPTY_NOTES: Note[] = []

export type TreeNodeType = 'project' | 'notebook' | 'section' | 'topic' | 'note' | 'unsorted'

export interface TreeNode {
  type: TreeNodeType
  id: string          // entity ID (project id, notebook id, section id, etc.)
  nodeId: string      // prefixed unique ID for expand state (e.g. "prj::abc", "nb::abc")
  name: string
  children: TreeNode[]
  count: number       // total note count in subtree
  isSystem?: boolean
  isPinned?: boolean
  isFavorite?: boolean
  color?: string | null
  emoji?: string | null
  /** Per-node sort preference (set only on `project` and `notebook` nodes). */
  sortPreference?: NotesSidebarSort | null
  // Context for adding children
  projectId?: string | null
  notebookId?: string | null
  sectionId?: string | null
  topicId?: string | null
}

function compareTitles(a: string, b: string): number {
  return (a || 'Untitled').localeCompare(b || 'Untitled')
}

function sortNotes(notes: Note[], sortMode: NotesSidebarSort): Note[] {
  return [...notes].sort((a, b) => {
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1

    switch (sortMode) {
      case 'title-asc':
        return compareTitles(a.title, b.title)
      case 'title-desc':
        return compareTitles(b.title, a.title)
      case 'created-desc':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case 'created-asc':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      case 'updated-asc':
        return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
      case 'updated-desc':
      default:
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    }
  })
}

/**
 * Sort notebook tree-nodes by an explicit sort mode. Used when a project
 * has a per-project sort preference set; otherwise the caller preserves
 * the manual `sortOrder` ordering (drag-to-reorder).
 */
function sortNotebookNodes(
  nodes: TreeNode[],
  sortMode: NotesSidebarSort,
  metaById: Map<string, { createdAt: string; updatedAt: string }>,
): TreeNode[] {
  return [...nodes].sort((a, b) => {
    const ma = metaById.get(a.id)
    const mb = metaById.get(b.id)
    switch (sortMode) {
      case 'title-asc':
        return compareTitles(a.name, b.name)
      case 'title-desc':
        return compareTitles(b.name, a.name)
      case 'created-desc':
        return new Date(mb?.createdAt ?? 0).getTime() - new Date(ma?.createdAt ?? 0).getTime()
      case 'created-asc':
        return new Date(ma?.createdAt ?? 0).getTime() - new Date(mb?.createdAt ?? 0).getTime()
      case 'updated-asc':
        return new Date(ma?.updatedAt ?? 0).getTime() - new Date(mb?.updatedAt ?? 0).getTime()
      case 'updated-desc':
      default:
        return new Date(mb?.updatedAt ?? 0).getTime() - new Date(ma?.updatedAt ?? 0).getTime()
    }
  })
}

function noteToTreeNode(note: Note): TreeNode {
  return {
    type: 'note',
    id: note.id,
    nodeId: `note::${note.id}`,
    name: note.title || 'Untitled',
    children: [],
    count: 0,
    isPinned: note.isPinned,
    isFavorite: note.isFavorite,
    color: note.color ?? null,
    emoji: note.emoji ?? null,
    notebookId: note.notebookId,
    sectionId: note.sectionId,
    topicId: note.topicId,
  }
}

function countNotes(node: TreeNode): number {
  if (node.type === 'note') return 1
  let total = 0
  for (const child of node.children) {
    total += child.type === 'note' ? 1 : child.count
  }
  return total
}

/** Prune tree to only branches containing notes that match the label */
function pruneByLabel(nodes: TreeNode[], labelId: string, allNotes: Note[]): TreeNode[] {
  const matchingNoteIds = new Set(allNotes.filter((n) => n.labels.includes(labelId)).map((n) => n.id))
  return pruneTree(nodes, matchingNoteIds)
}

function pruneTree(nodes: TreeNode[], matchingNoteIds: Set<string>): TreeNode[] {
  const result: TreeNode[] = []
  for (const node of nodes) {
    if (node.type === 'note') {
      if (matchingNoteIds.has(node.id)) result.push(node)
    } else {
      const prunedChildren = pruneTree(node.children, matchingNoteIds)
      if (prunedChildren.length > 0) {
        const pruned = { ...node, children: prunedChildren, count: 0 }
        pruned.count = countNotes(pruned)
        result.push(pruned)
      }
    }
  }
  return result
}

function applySidebarFilter(nodes: TreeNode[], filter: NotesSidebarFilter, allNotes: Note[]): TreeNode[] {
  if (filter === 'all') return nodes

  if (filter === 'notebooks') {
    return nodes.filter((node) => node.type !== 'unsorted')
  }

  if (filter === 'unsorted') {
    return nodes.filter((node) => node.type === 'unsorted')
  }

  const pinnedNoteIds = new Set(allNotes.filter((n) => n.isPinned).map((n) => n.id))
  return pruneTree(nodes, pinnedNoteIds)
}

function noteMatchesFilter(note: Note, filter: NotesSidebarFilter): boolean {
  if (filter === 'all') return true
  if (filter === 'notebooks') return note.notebookId !== null
  if (filter === 'unsorted') return note.notebookId === null
  return note.isPinned
}

export function useNotesSidebarData() {
  const notebooks = useNoteNotebooksStore((s) => s.notebooks)
  const sections = useNoteSectionsStore((s) => s.sections)
  const topics = useNoteTopicsStore((s) => s.topics)
  const projects = useNoteProjectsStore((s) => s.projects)
  const labels = useNoteLabelsStore((s) => s.labels)
  const allNotes = useNotesStore((s) => s.notesByScope['notes-app::global::all'] ?? EMPTY_NOTES)

  const selectedLabelId = useNotesAppStore((s) => s.selectedLabelId)
  const selectedNoteId = useNotesAppStore((s) => s.selectedNoteId)
  const searchQuery = useNotesAppStore((s) => s.searchQuery)
  const expandedNodeIds = useNotesAppStore((s) => s.expandedNodeIds)
  const sidebarFilter = useNotesAppStore((s) => s.sidebarFilter)
  const sidebarSort = useNotesAppStore((s) => s.sidebarSort)

  const setSelectedLabelId = useNotesAppStore((s) => s.setSelectedLabelId)
  const setSelectedNoteId = useNotesAppStore((s) => s.setSelectedNoteId)
  const setSearchQuery = useNotesAppStore((s) => s.setSearchQuery)
  const toggleNodeExpanded = useNotesAppStore((s) => s.toggleNodeExpanded)
  const setSidebarFilter = useNotesAppStore((s) => s.setSidebarFilter)
  const setSidebarSort = useNotesAppStore((s) => s.setSidebarSort)

  // Build full tree
  const tree = useMemo(() => {
    // Resolve the effective sort mode for notes inside a notebook using the
    // inheritance chain: notebook → parent project → global sidebar default.
    const projectSortById = new Map<string, NotesSidebarSort | null>()
    for (const p of projects) projectSortById.set(p.id, p.sortPreference ?? null)

    const notesByNotebook = new Map<string | null, Note[]>()
    const notesBySection = new Map<string | null, Note[]>()
    const notesByTopic = new Map<string | null, Note[]>()

    // Group notes by their hierarchy keys
    for (const note of allNotes) {
      // Group by notebook
      const nbKey = note.notebookId
      if (!notesByNotebook.has(nbKey)) notesByNotebook.set(nbKey, [])
      notesByNotebook.get(nbKey)!.push(note)

      // Group by section (only if has a notebook)
      if (note.notebookId) {
        const secKey = note.sectionId
        if (!notesBySection.has(secKey)) notesBySection.set(secKey, [])
        notesBySection.get(secKey)!.push(note)
      }

      // Group by topic (only if has a section)
      if (note.sectionId) {
        const topicKey = note.topicId
        if (!notesByTopic.has(topicKey)) notesByTopic.set(topicKey, [])
        notesByTopic.get(topicKey)!.push(note)
      }
    }

    const rootNodes: TreeNode[] = []

    // Build notebook nodes
    const sortedNotebooks = [...notebooks].sort((a, b) => a.sortOrder - b.sortOrder)
    for (const nb of sortedNotebooks) {
      const parentProjectSort = nb.projectId ? projectSortById.get(nb.projectId) ?? null : null
      const effectiveNotebookSort: NotesSidebarSort =
        nb.sortPreference ?? parentProjectSort ?? sidebarSort

      const nbSections = sections
        .filter((s) => s.notebookId === nb.id)
        .sort((a, b) => a.sortOrder - b.sortOrder)

      const sectionNodes: TreeNode[] = []

      for (const sec of nbSections) {
        const secTopics = topics
          .filter((t) => t.sectionId === sec.id)
          .sort((a, b) => a.sortOrder - b.sortOrder)

        const topicNodes: TreeNode[] = []

        for (const topic of secTopics) {
          // Notes under this topic
          const topicNotes = sortNotes(
            allNotes.filter(
              (n) => n.notebookId === nb.id && n.sectionId === sec.id && n.topicId === topic.id
            ),
            effectiveNotebookSort
          )
          const topicNode: TreeNode = {
            type: 'topic',
            id: topic.id,
            nodeId: `topic::${topic.id}`,
            name: topic.name,
            children: topicNotes.map(noteToTreeNode),
            count: topicNotes.length,
            color: topic.color ?? null,
            emoji: topic.emoji ?? null,
            notebookId: nb.id,
            sectionId: sec.id,
            topicId: topic.id,
          }
          topicNodes.push(topicNode)
        }

        // Notes directly under section (no topic)
        const sectionDirectNotes = sortNotes(
          allNotes.filter(
            (n) => n.notebookId === nb.id && n.sectionId === sec.id && n.topicId === null
          ),
          effectiveNotebookSort
        )

        const sectionChildren: TreeNode[] = [
          ...topicNodes,
          ...sectionDirectNotes.map(noteToTreeNode),
        ]
        const sectionNode: TreeNode = {
          type: 'section',
          id: sec.id,
          nodeId: `sec::${sec.id}`,
          name: sec.name,
          children: sectionChildren,
          count: 0,
          color: sec.color ?? null,
          emoji: sec.emoji ?? null,
          notebookId: nb.id,
          sectionId: sec.id,
        }
        sectionNode.count = countNotes(sectionNode)
        sectionNodes.push(sectionNode)
      }

      // Notes directly under notebook (no section)
      const nbDirectNotes = sortNotes(
        allNotes.filter(
          (n) => n.notebookId === nb.id && n.sectionId === null
        ),
        effectiveNotebookSort
      )

      const nbChildren: TreeNode[] = [
        ...sectionNodes,
        ...nbDirectNotes.map(noteToTreeNode),
      ]
      const nbNode: TreeNode = {
        type: 'notebook',
        id: nb.id,
        nodeId: `nb::${nb.id}`,
        name: nb.name,
        children: nbChildren,
        count: 0,
        isSystem: nb.isSystem,
        color: nb.color ?? null,
        emoji: nb.emoji ?? null,
        sortPreference: nb.sortPreference ?? null,
        projectId: nb.projectId ?? null,
        notebookId: nb.id,
      }
      nbNode.count = countNotes(nbNode)
      rootNodes.push(nbNode)
    }

    // Unsorted notes (no notebook)
    const unsortedNotes = sortNotes(allNotes.filter((n) => n.notebookId === null), sidebarSort)
    if (unsortedNotes.length > 0) {
      rootNodes.push({
        type: 'unsorted',
        id: 'unsorted',
        nodeId: 'unsorted',
        name: 'Unsorted',
        children: unsortedNotes.map(noteToTreeNode),
        count: unsortedNotes.length,
      })
    }

    return rootNodes
  }, [allNotes, notebooks, sections, topics, projects, sidebarSort])

  // Build per-project tree nodes. Each project becomes a root node whose
  // children are the notebook nodes (built above) that have matching
  // `projectId`. Notebooks without a project remain unattached and continue
  // to render under the existing "All Notebooks" section.
  const projectTree = useMemo(() => {
    // Lookup table for sorting notebook nodes by their underlying NoteNotebook
    // timestamps (used only when a project has an explicit sort preference).
    const notebookMetaById = new Map<string, { createdAt: string; updatedAt: string }>()
    for (const nb of notebooks) {
      notebookMetaById.set(nb.id, { createdAt: nb.createdAt, updatedAt: nb.updatedAt })
    }
    const notebookById = new Map<string, TreeNode>()
    for (const n of tree) {
      if (n.type === 'notebook') notebookById.set(n.id, n)
    }
    const sortedProjects = [...projects].sort((a, b) => {
      if (a.isFavorite !== b.isFavorite) return a.isFavorite ? -1 : 1
      return a.sortOrder - b.sortOrder
    })
    const projectNodes: TreeNode[] = []
    for (const p of sortedProjects) {
      let children: TreeNode[] = []
      for (const nb of tree) {
        if (nb.type !== 'notebook') continue
        if (nb.projectId !== p.id) continue
        // Exclude the system QuickNote notebook — it renders in its own section
        if (nb.isSystem) continue
        children.push(nb)
      }
      // Apply per-project notebook ordering when set, otherwise preserve the
      // manual `sortOrder` ordering (drag-to-reorder).
      if (p.sortPreference) {
        children = sortNotebookNodes(children, p.sortPreference, notebookMetaById)
      }
      const projectNode: TreeNode = {
        type: 'project',
        id: p.id,
        nodeId: `prj::${p.id}`,
        name: p.name,
        children,
        count: 0,
        isSystem: p.isSystem,
        isFavorite: p.isFavorite,
        color: p.color ?? null,
        emoji: p.emoji ?? null,
        sortPreference: p.sortPreference ?? null,
        projectId: p.id,
      }
      projectNode.count = countNotes(projectNode)
      projectNodes.push(projectNode)
    }
    return projectNodes
  }, [tree, projects, notebooks])

  // Apply label filter
  const filteredTree = useMemo(() => {
    const labelFiltered = selectedLabelId ? pruneByLabel(tree, selectedLabelId, allNotes) : tree
    return applySidebarFilter(labelFiltered, sidebarFilter, allNotes)
  }, [tree, selectedLabelId, allNotes, sidebarFilter])

  // Search: flatten to matching notes
  const searchResults = useMemo(() => {
    if (!searchQuery) return null
    const q = searchQuery.toLowerCase()
    const matching = allNotes.filter((n) =>
      noteMatchesFilter(n, sidebarFilter)
      && (n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q))
    )
    return sortNotes(matching, sidebarSort).map(noteToTreeNode)
  }, [allNotes, searchQuery, sidebarFilter, sidebarSort])

  // Favorites: flat list of favorited notes
  const favoriteNodes = useMemo(() => {
    const fav = allNotes.filter((n) => n.isFavorite)
    return sortNotes(fav, sidebarSort).map(noteToTreeNode)
  }, [allNotes, sidebarSort])

  // Pinned: flat list of pinned notes
  const pinnedNodes = useMemo(() => {
    const pinned = allNotes.filter((n) => n.isPinned)
    return sortNotes(pinned, sidebarSort).map(noteToTreeNode)
  }, [allNotes, sidebarSort])

  // Trashed notes from app store
  const trashedNotes = useNotesAppStore((s) => s.trashedNotes)
  const trashedNodes = useMemo(() => {
    return trashedNotes.map(noteToTreeNode)
  }, [trashedNotes])

  const handleAddPage = useCallback(
    async (notebookId?: string | null, sectionId?: string | null, topicId?: string | null) => {
      const addNote = useNotesStore.getState().addNote
      const note = await addNote('notes-app', 'global', 'all')
      const updates: Partial<Note> = {}
      if (notebookId) updates.notebookId = notebookId
      if (sectionId) updates.sectionId = sectionId
      if (topicId) updates.topicId = topicId
      if (Object.keys(updates).length > 0) {
        await useNotesStore.getState().updateNote({ ...note, ...updates })
      }
      // New notes open in Edit mode (single-pane view derives mode from global notesMode).
      useSettingsStore.getState().setNotesMode('edit')
      setSelectedNoteId(note.id)
    },
    [setSelectedNoteId]
  )

  return {
    tree: filteredTree,
    projectTree,
    projects,
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
  }
}
