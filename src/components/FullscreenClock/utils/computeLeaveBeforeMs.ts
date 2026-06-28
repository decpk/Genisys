/**
 * Compute how long before auto-dismiss we should snap the modal into
 * Picture-in-Picture "mini mode". The target is a hard 2-second PiP window;
 * for very short timeouts we cap at half the timeout so the user still gets
 * to see the centered face before it slides into the corner.
 */
export function computeLeaveBeforeMs(timeoutMs: number): number {
  return Math.max(800, Math.min(2000, Math.round(timeoutMs * 0.5)))
}
