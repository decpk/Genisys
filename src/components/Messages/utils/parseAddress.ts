// Split a pasted address into its host and port parts. Accepts forms like
// `192.168.1.42:47820`, `host.local:4040`, a bare host, or a bare port, and
// tolerates surrounding whitespace, a leading scheme (`tcp://`), and trailing
// slashes. Returns `{ host, port }` where each is non-null only when present
// in the input. Never throws — purely best-effort parsing for UX convenience.
export function parseAddress(raw: string): { host: string | null; port: string | null } {
  let value = raw.trim()
  if (!value) return { host: null, port: null }

  // Strip an optional scheme prefix (e.g. `tcp://`, `genisys://`).
  value = value.replace(/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//, '')
  // Drop any path/query/fragment and trailing slashes.
  value = value.split(/[/?#]/)[0].trim()
  if (!value) return { host: null, port: null }

  // A bare number with no host is treated as a port.
  if (/^\d+$/.test(value)) {
    return { host: null, port: value }
  }

  const lastColon = value.lastIndexOf(':')
  if (lastColon === -1) {
    return { host: value, port: null }
  }

  const host = value.slice(0, lastColon).trim()
  const portPart = value.slice(lastColon + 1).trim()
  if (/^\d+$/.test(portPart)) {
    return { host: host || null, port: portPart }
  }

  // Colon present but trailing part isn't numeric — treat the whole thing as host.
  return { host: value, port: null }
}
