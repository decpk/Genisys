import type { SensitiveMatch } from '../sensitiveData.types'

const CARD_PATTERN = /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})\b/g

function luhnCheck(num: string): boolean {
  const digits = num.replace(/\D/g, '')
  let sum = 0
  let alternate = false

  for (let i = digits.length - 1; i >= 0; i--) {
    let n = parseInt(digits[i], 10)
    if (alternate) {
      n *= 2
      if (n > 9) n -= 9
    }
    sum += n
    alternate = !alternate
  }

  return sum % 10 === 0
}

export function detectCreditCard(text: string): SensitiveMatch[] {
  const matches: SensitiveMatch[] = []
  CARD_PATTERN.lastIndex = 0

  let match: RegExpExecArray | null
  while ((match = CARD_PATTERN.exec(text)) !== null) {
    const digits = match[0].replace(/\D/g, '')
    if (luhnCheck(digits)) {
      matches.push({
        type: 'credit_card',
        label: 'Credit Card',
        level: 'critical',
        start: match.index,
        end: match.index + match[0].length,
      })
    }
  }

  return matches
}
