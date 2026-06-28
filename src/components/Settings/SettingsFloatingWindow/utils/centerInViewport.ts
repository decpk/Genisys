import type {
  WindowPosition,
  WindowSize,
} from '@/store/settings-drawer-store'

/**
 * Returns top-left coords that center a window of the given `size`
 * inside `viewport`, biased slightly above true center for aesthetic
 * balance (matches command-palette / file-dialog conventions).
 */
export function centerInViewport(
  size: WindowSize,
  viewport: { width: number; height: number },
): WindowPosition {
  const x = Math.max(0, Math.round((viewport.width - size.width) / 2))
  const yCenter = Math.round((viewport.height - size.height) / 2)
  // Bias 10% upward so the window sits visually balanced.
  const yBias = Math.round(viewport.height * 0.05)
  const y = Math.max(0, yCenter - yBias)
  return { x, y }
}
