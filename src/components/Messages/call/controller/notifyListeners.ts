import type { CallControllerContext } from '../call-controller.types'

/** Notifies every UI subscriber that a stream or controller field changed. */
export function notifyListeners(ctx: CallControllerContext): void {
  for (const listener of ctx.listeners) {
    listener()
  }
}
