export interface StaticResponseTabProps {
  /** Current JSON response body. */
  value: string
  /** Called with the next JSON string when the body changes. */
  onChange: (value: string) => void
}
