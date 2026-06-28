import { randomId } from '../utils/randomId'
import { randomInt } from '../utils/randomInt'
import { slugify } from '../utils/slugify'
import { pickOne } from '../utils/pickOne'
import { COMPANY_NAMES } from '../seeds/companyNames'
import { INDUSTRIES } from '../seeds/industries'
import { CITIES } from '../seeds/cities'

/** Generates an array of fake company records. */
export function generateCompanies(count: number): unknown {
  return Array.from({ length: count }, () => {
    const name = pickOne(COMPANY_NAMES)
    return {
      id: randomId(),
      name,
      slug: slugify(name),
      industry: pickOne(INDUSTRIES),
      employees: randomInt(5, 50000),
      city: pickOne(CITIES),
      website: `https://www.${slugify(name)}.com`,
      foundedYear: randomInt(1950, 2023)
    }
  })
}
