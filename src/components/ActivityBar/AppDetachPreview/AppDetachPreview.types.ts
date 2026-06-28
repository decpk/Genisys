export interface AppDetachPreviewProps {
  /** Same icon component used by the source button. */
  icon: React.ComponentType<{ size: number; strokeWidth?: number }>
  /** When true, show the "release to detach" drop hint next to the icon. */
  showDropHint: boolean
}
