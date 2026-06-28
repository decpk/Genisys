/**
 * Decode a quoted-printable encoded string back to UTF-8 text.
 *
 * The naive approach of decoding each =XX as String.fromCharCode() breaks
 * multi-byte UTF-8 sequences (e.g. =E2=80=93 → "–"). Instead we collect
 * raw bytes and use TextDecoder for proper UTF-8 handling.
 */
export function decodeQuotedPrintable(input: string): string {
  // First remove soft line breaks (=\r\n or =\n)
  const cleaned = input.replace(/=\r?\n/g, '')

  const bytes: number[] = []

  let i = 0
  while (i < cleaned.length) {
    if (
      cleaned[i] === '=' &&
      i + 2 < cleaned.length &&
      isHexChar(cleaned[i + 1]) &&
      isHexChar(cleaned[i + 2])
    ) {
      bytes.push(parseInt(cleaned[i + 1] + cleaned[i + 2], 16))
      i += 3
    } else {
      bytes.push(cleaned.charCodeAt(i))
      i += 1
    }
  }

  return new TextDecoder('utf-8').decode(new Uint8Array(bytes))
}

function isHexChar(c: string): boolean {
  return /[0-9A-Fa-f]/.test(c)
}
