import { randomId } from '../utils/randomId'
import { randomInt } from '../utils/randomInt'
import { randomEmail } from '../utils/randomEmail'
import { randomDateIso } from '../utils/randomDateIso'
import { randomSentence } from '../utils/randomSentence'
import { randomFullName } from '../utils/randomFullName'

/** Generates an array of fake comment records. */
export function generateComments(count: number): unknown {
  return Array.from({ length: count }, () => {
    const author = randomFullName()
    return {
      id: randomId(),
      postId: randomId(),
      author: author.fullName,
      email: randomEmail(author.firstName, author.lastName),
      body: randomSentence(randomInt(8, 16)),
      likes: randomInt(0, 200),
      createdAt: randomDateIso()
    }
  })
}
