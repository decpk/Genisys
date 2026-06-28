/**
 * Creates an RTCPeerConnection with NO STUN/TURN servers.
 *
 * LAN-only by design (security requirement): an empty `iceServers` list forces
 * the connection to gather only host candidates, so media never traverses any
 * external server and nothing leaks to the internet. Do NOT add STUN/TURN here.
 */
export function createPeerConnection(): RTCPeerConnection {
  return new RTCPeerConnection({ iceServers: [] })
}
