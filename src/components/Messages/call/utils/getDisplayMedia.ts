/**
 * Requests the screen-share stream (video only) via getDisplayMedia.
 * Throws a clear Error if capture is unavailable or the user cancels.
 */
export async function getDisplayMedia(): Promise<MediaStream> {
  try {
    return await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: false,
    })
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err)
    throw new Error(`Failed to start screen sharing: ${detail}`)
  }
}
