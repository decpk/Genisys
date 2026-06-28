/**
 * Extracts the first DTLS certificate fingerprint from an SDP blob.
 *
 * Parses the first `a=fingerprint:<algo> <hash>` line and returns the
 * normalized `"<algo> <hash>"` value (lowercased), or null when no
 * fingerprint line is present. Used to bind the DTLS identity to the
 * Noise-authenticated signaling channel (anti-MITM).
 */
export function extractDtlsFingerprint(sdp: string): string | null {
  const lines = sdp.split(/\r\n|\r|\n/)
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed.startsWith('a=fingerprint:')) continue
    const value = trimmed.slice('a=fingerprint:'.length).trim()
    if (value.length === 0) return null
    return value.toLowerCase()
  }
  return null
}
