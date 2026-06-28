/** Identifier for a drag-drop claimer — keep these short, kebab-cased, and namespaced (e.g. `library:new-book`). */
export type DragDropClaimId = string

export interface DragDropClaimRelease {
  (): void
}
