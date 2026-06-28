import { randomId } from '../utils/randomId'
import { randomInt } from '../utils/randomInt'
import { randomBool } from '../utils/randomBool'
import { randomPrice } from '../utils/randomPrice'
import { randomDateIso } from '../utils/randomDateIso'
import { slugify } from '../utils/slugify'
import { pickOne } from '../utils/pickOne'
import { PRODUCT_ADJECTIVES } from '../seeds/productAdjectives'
import { PRODUCT_NOUNS } from '../seeds/productNouns'
import { PRODUCT_CATEGORIES } from '../seeds/productCategories'

/** Generates an array of fake product records. */
export function generateProducts(count: number): unknown {
  return Array.from({ length: count }, () => {
    const name = `${pickOne(PRODUCT_ADJECTIVES)} ${pickOne(PRODUCT_NOUNS)}`
    return {
      id: randomId(),
      name,
      slug: slugify(name),
      sku: `SKU-${randomInt(10000, 99999)}`,
      price: randomPrice(5, 500),
      currency: 'USD',
      category: pickOne(PRODUCT_CATEGORIES),
      inStock: randomBool(0.85),
      stock: randomInt(0, 250),
      rating: randomPrice(1, 5),
      createdAt: randomDateIso()
    }
  })
}
