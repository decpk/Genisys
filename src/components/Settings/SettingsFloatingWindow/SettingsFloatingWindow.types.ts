import type { WindowPosition, WindowSize } from '@/store/settings-drawer-store'

export interface SettingsFloatingWindowProps {
  /** Current active app (passed through to header subtitle). */
  activeApp: string
  /** Escalate to the full Settings app and close the window. */
  onOpenFullApp: () => void
}

export interface SettingsFloatingWindowHeaderProps {
  activeApp: string
  isDragging: boolean
  onOpenFullApp: () => void
  onClose: () => void
  /** Spread onto the drag region (everything except the close button). */
  dragHandleProps: {
    onPointerDown: (event: React.PointerEvent) => void
  }
}

export interface SettingsFloatingWindowResizerProps {
  isResizing: boolean
  resizeHandleProps: {
    onPointerDown: (event: React.PointerEvent) => void
  }
}

export interface UseSettingsFloatingWindowDataReturn {
  isOpen: boolean
  isLoaded: boolean
  position: WindowPosition | null
  size: WindowSize
  setPosition: (position: WindowPosition) => void
  setSize: (size: WindowSize) => void
  close: () => void
}
