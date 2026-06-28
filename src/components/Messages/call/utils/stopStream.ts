/**
 * Stops every track on a MediaStream, releasing the underlying devices
 * (camera light off, mic released). Safe to call with null.
 */
export function stopStream(stream: MediaStream | null): void {
  if (!stream) return
  for (const track of stream.getTracks()) {
    track.stop()
  }
}
