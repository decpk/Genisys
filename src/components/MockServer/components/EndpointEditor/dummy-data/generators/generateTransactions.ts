import { randomId } from '../utils/randomId'
import { randomInt } from '../utils/randomInt'
import { randomPrice } from '../utils/randomPrice'
import { randomDateIso } from '../utils/randomDateIso'
import { randomSentence } from '../utils/randomSentence'
import { pickOne } from '../utils/pickOne'
import { TRANSACTION_TYPES } from '../seeds/transactionTypes'
import { CURRENCIES } from '../seeds/currencies'

/** Generates an array of fake transaction records. */
export function generateTransactions(count: number): unknown {
  return Array.from({ length: count }, () => ({
    id: randomId(),
    reference: `TXN-${randomInt(1000000, 9999999)}`,
    type: pickOne(TRANSACTION_TYPES),
    amount: randomPrice(1, 5000),
    currency: pickOne(CURRENCIES),
    status: pickOne(['pending', 'completed', 'failed']),
    description: randomSentence(randomInt(4, 8)),
    createdAt: randomDateIso()
  }))
}
