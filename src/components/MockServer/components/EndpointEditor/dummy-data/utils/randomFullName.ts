import { pickOne } from './pickOne'
import { FIRST_NAMES } from '../seeds/firstNames'
import { LAST_NAMES } from '../seeds/lastNames'

/** Returns a random first/last/full name triple. */
export function randomFullName(): { firstName: string; lastName: string; fullName: string } {
  const firstName = pickOne(FIRST_NAMES)
  const lastName = pickOne(LAST_NAMES)
  return { firstName, lastName, fullName: `${firstName} ${lastName}` }
}
