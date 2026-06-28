const ANGLE_GENERIC = /<[A-Z]\w*(\s*[,|&]\s*\w+)*>/

/** True when text contains an angle-bracket generic argument (e.g. `Promise<T>`, `Map<K, V>`). */
export function hasAngleGeneric(text: string): boolean {
  return ANGLE_GENERIC.test(text)
}
