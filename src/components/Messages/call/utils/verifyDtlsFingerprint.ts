import { extractDtlsFingerprint } from './extractDtlsFingerprint'

/**
 * Verifies that the DTLS fingerprint negotiated on the live connection matches
 * the one that was signaled over the Noise-authenticated channel.
 *
 * Returns true when there is nothing to compare (signaledFingerprint is null),
 * otherwise true only when the negotiated SDP's fingerprint equals the signaled
 * one. A false result indicates a possible media MITM — abort the call.
 */
export function verifyDtlsFingerprint(
  negotiatedSdp: string,
  signaledFingerprint: string | null
): boolean {
  if (signaledFingerprint === null) return true
  const negotiated = extractDtlsFingerprint(negotiatedSdp)
  if (negotiated === null) return false
  return negotiated === signaledFingerprint.toLowerCase()
}
