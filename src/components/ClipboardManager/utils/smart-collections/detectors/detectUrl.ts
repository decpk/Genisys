const URL_PATTERN = /https?:\/\/[^\s<>"{}|\\^`[\]]+/i
const PROTOCOL_PATTERN = /^(ftp|ssh|ws|wss):\/\/[^\s]+/i

export function detectUrl(text: string): boolean {
  return URL_PATTERN.test(text) || PROTOCOL_PATTERN.test(text)
}
