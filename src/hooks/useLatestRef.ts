import { useEffect, useRef } from 'react'
import type { MutableRefObject } from 'react'

/**
 * Keeps a ref synchronized with the latest value across renders.
 *
 * Useful inside long-lived async callbacks (event listeners, runners,
 * promises) that need to read the most recent value without being
 * recreated on every render.
 */
export function useLatestRef<T>(value: T): MutableRefObject<T> {
  const ref = useRef<T>(value)
  useEffect(() => {
    ref.current = value
  }, [value])
  return ref
}
