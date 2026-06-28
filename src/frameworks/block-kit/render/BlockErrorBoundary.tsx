import { Component, type ReactNode } from 'react'

interface BlockErrorBoundaryProps {
  /** Tag name, for the fallback message. */
  tag: string
  children: ReactNode
}

interface BlockErrorBoundaryState {
  hasError: boolean
}

/**
 * Isolates a single block render. A throwing block degrades to a small inline
 * notice instead of taking down the whole document.
 */
export class BlockErrorBoundary extends Component<
  BlockErrorBoundaryProps,
  BlockErrorBoundaryState
> {
  state: BlockErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): BlockErrorBoundaryState {
    return { hasError: true }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="bk-block-error" role="note">
          Could not render <code>{this.props.tag}</code> block.
        </div>
      )
    }
    return this.props.children
  }
}
