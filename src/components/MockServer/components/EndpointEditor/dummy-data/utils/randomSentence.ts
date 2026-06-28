import { pickOne } from './pickOne'
import { LOREM_WORDS } from '../seeds/loremWords'

/** Builds a capitalized lorem-ipsum sentence of `wordCount` words. */
export function randomSentence(wordCount = 8): string {
  const words: string[] = []
  for (let i = 0; i < wordCount; i++) words.push(pickOne(LOREM_WORDS))
  const sentence = words.join(' ')
  return sentence.charAt(0).toUpperCase() + sentence.slice(1) + '.'
}
