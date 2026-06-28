// ── PBKDF2 Password Hashing via Web Crypto API ──────────────────────
// Uses SHA-256 with 600,000 iterations per OWASP 2023 recommendations.
// All operations are async and use the browser's native crypto.subtle.

const ITERATIONS = 600_000
const HASH_ALGORITHM = 'SHA-256'
const KEY_LENGTH_BITS = 256
const SALT_LENGTH_BYTES = 16

function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function hexToBuffer(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16)
  }
  return bytes
}

async function deriveKey(password: string, salt: Uint8Array): Promise<ArrayBuffer> {
  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  )

  return crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: ITERATIONS, hash: HASH_ALGORITHM },
    keyMaterial,
    KEY_LENGTH_BITS
  )
}

export async function hashPassword(password: string): Promise<{ hash: string; salt: string }> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH_BYTES))
  const derivedBits = await deriveKey(password, salt)
  return {
    hash: bufferToHex(derivedBits),
    salt: bufferToHex(salt),
  }
}

export async function verifyPassword(
  password: string,
  storedHash: string,
  storedSalt: string
): Promise<boolean> {
  const salt = hexToBuffer(storedSalt)
  const derivedBits = await deriveKey(password, salt)
  const derivedHex = bufferToHex(derivedBits)

  // Timing-safe comparison: always compare all characters
  if (derivedHex.length !== storedHash.length) return false
  let result = 0
  for (let i = 0; i < derivedHex.length; i++) {
    result |= derivedHex.charCodeAt(i) ^ storedHash.charCodeAt(i)
  }
  return result === 0
}
