import type { NotebookRowProjectSuffixProps } from './NotebookRowProjectSuffix.types'
import { notebookRowProjectSuffixClass } from './NotebookRowProjectSuffix.styles'

export function NotebookRowProjectSuffix(props: NotebookRowProjectSuffixProps) {
  const { suffix } = props
  if (suffix == null) return null
  return <span className={notebookRowProjectSuffixClass}>{suffix}</span>
}
