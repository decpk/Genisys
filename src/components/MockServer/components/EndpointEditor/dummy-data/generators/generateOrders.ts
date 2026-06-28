import { randomId } from '../utils/randomId'
import { randomInt } from '../utils/randomInt'
import { randomPrice } from '../utils/randomPrice'
import { randomEmail } from '../utils/randomEmail'
import { randomDateIso } from '../utils/randomDateIso'
import { randomFullName } from '../utils/randomFullName'
import { pickOne } from '../utils/pickOne'
import { ORDER_STATUSES } from '../seeds/orderStatuses'
import { CURRENCIES } from '../seeds/currencies'

/** Generates an array of fake order records. */
export function generateOrders(count: number): unknown {
  return Array.from({ length: count }, () => {
    const customer = randomFullName()
    return {
      id: randomId(),
      orderNumber: `ORD-${randomInt(100000, 999999)}`,
      customer: customer.fullName,
      email: randomEmail(customer.firstName, customer.lastName),
      status: pickOne(ORDER_STATUSES),
      itemCount: randomInt(1, 8),
      total: randomPrice(10, 2000),
      currency: pickOne(CURRENCIES),
      createdAt: randomDateIso()
    }
  })
}
