import { randomSentence } from './randomSentence'
import { randomInt } from './randomInt'

/** Builds a lorem-ipsum paragraph of `sentenceCount` sentences. */
export function randomParagraph(sentenceCount = 3): string {
  const sentences: string[] = []
  for (let i = 0; i < sentenceCount; i++) sentences.push(randomSentence(randomInt(6, 14)))
  return sentences.join(' ')
}
