import { randomId } from '../utils/randomId'
import { randomInt } from '../utils/randomInt'
import { randomBool } from '../utils/randomBool'
import { randomDateIso } from '../utils/randomDateIso'
import { randomSentence } from '../utils/randomSentence'
import { randomParagraph } from '../utils/randomParagraph'
import { randomFullName } from '../utils/randomFullName'
import { slugify } from '../utils/slugify'
import { pickSome } from '../utils/pickSome'

/** Generates an array of fake blog post records. */
export function generatePosts(count: number): unknown {
  return Array.from({ length: count }, () => {
    const title = randomSentence(randomInt(4, 8))
    const author = randomFullName()
    return {
      id: randomId(),
      title,
      slug: slugify(title),
      excerpt: randomSentence(12),
      body: randomParagraph(randomInt(3, 5)),
      author: author.fullName,
      tags: pickSome(['tech', 'news', 'tutorial', 'opinion', 'guide', 'review'], randomInt(1, 3)),
      published: randomBool(0.7),
      views: randomInt(0, 10000),
      createdAt: randomDateIso()
    }
  })
}
