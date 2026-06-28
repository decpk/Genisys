import { randomId } from '../utils/randomId'
import { randomBool } from '../utils/randomBool'
import { randomEmail } from '../utils/randomEmail'
import { randomDateIso } from '../utils/randomDateIso'
import { randomFullName } from '../utils/randomFullName'
import { randomAvatarUrl } from '../utils/randomAvatarUrl'
import { pickOne } from '../utils/pickOne'
import { JOB_TITLES } from '../seeds/jobTitles'
import { CITIES } from '../seeds/cities'

/** Generates an array of fake user records. */
export function generateUsers(count: number): unknown {
  return Array.from({ length: count }, () => {
    const { firstName, lastName, fullName } = randomFullName()
    return {
      id: randomId(),
      name: fullName,
      firstName,
      lastName,
      email: randomEmail(firstName, lastName),
      avatar: randomAvatarUrl(fullName),
      jobTitle: pickOne(JOB_TITLES),
      city: pickOne(CITIES),
      isActive: randomBool(0.8),
      createdAt: randomDateIso()
    }
  })
}
