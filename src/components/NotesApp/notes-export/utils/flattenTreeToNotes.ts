import type { TreeNode } from '../../components/NotesSidebar/useNotesSidebarData'

/**
 * One note collected from a depth-first walk of a container `TreeNode`,
 * carrying the breadcrumb of named ancestors **below** the export root
 * (the export root itself is excluded so its name doesn't appear in
 * every chapter title).
 *
 * `content` is intentionally not included here — `flattenTreeToNotes`
 * only resolves the tree structure. The export collector pairs each
 * entry with its underlying `Note.content` separately so this helper
 * stays decoupled from the notes store.
 */
export interface FlattenedNote {
  noteId: string
  noteTitle: string
  /** Names of ancestor containers between the export root (exclusive) and the note (exclusive). */
  breadcrumbSegments: string[]
}

/**
 * Depth-first walk over `root.children` collecting every descendant
 * note in display order. The export root's name is **not** included in
 * the breadcrumb (we want chapter titles relative to what the user
 * chose to export, not the root they already see in the book title).
 *
 * Notes directly under the export root return with an empty
 * `breadcrumbSegments` array.
 */
export function flattenTreeToNotes(root: TreeNode): FlattenedNote[] {
  const out: FlattenedNote[] = []

  function visit(node: TreeNode, segments: string[]): void {
    for (const child of node.children) {
      if (child.type === 'note') {
        out.push({
          noteId: child.id,
          noteTitle: child.name,
          breadcrumbSegments: segments,
        })
        continue
      }
      visit(child, [...segments, child.name])
    }
  }

  // Walk the root's children with an empty breadcrumb so the root
  // itself never appears as a segment.
  visit(root, [])
  return out
}
