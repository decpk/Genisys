// Validate a manual host + port entry. Accepts IPv4 addresses and simple
// hostnames; the port must be an integer in 1..65535. Returns a parsed port
// on success or a human-readable error on failure (never throws).
export function validateHostPort(
  host: string,
  port: string
): { ok: boolean; error: string | null; port: number | null } {
  const trimmedHost = host.trim()
  if (!trimmedHost) {
    return { ok: false, error: 'Host is required.', port: null }
  }

  const ipv4 =
    /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/
  const hostname = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
  const isValidHost = ipv4.test(trimmedHost) || hostname.test(trimmedHost)
  if (!isValidHost) {
    return { ok: false, error: 'Enter a valid IP address or hostname.', port: null }
  }

  const trimmedPort = port.trim()
  if (!/^\d+$/.test(trimmedPort)) {
    return { ok: false, error: 'Port must be a number.', port: null }
  }
  const parsedPort = Number(trimmedPort)
  if (parsedPort < 1 || parsedPort > 65535) {
    return { ok: false, error: 'Port must be between 1 and 65535.', port: null }
  }

  return { ok: true, error: null, port: parsedPort }
}
