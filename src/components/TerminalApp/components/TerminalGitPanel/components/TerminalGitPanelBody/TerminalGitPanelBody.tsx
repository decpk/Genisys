import { AppInlineLoader } from '@/components/AppLoader'
import { CollapsibleSection } from '@/components/ProjectExplorer/components/GitPanel/components/CollapsibleSection'
import {
  categorizeByIndex,
  categorizeFile,
} from '@/components/ProjectExplorer/components/GitPanel/GitPanel.utils'

import { terminalGitPanelStyles as s } from '../../TerminalGitPanel.styles'
import { TerminalGitEmpty } from '../TerminalGitEmpty'
import { TerminalGitFileRow } from '../TerminalGitFileRow'
import type { TerminalGitPanelBodyProps } from './TerminalGitPanelBody.types'

/** Git panel body: load/empty states + staged / unstaged change sections. */
export function TerminalGitPanelBody(props: TerminalGitPanelBodyProps) {
  const { data } = props

  if (!data.cwd) return <TerminalGitEmpty variant="no-cwd" />
  if (data.isLoading && data.files.length === 0 && !data.error) {
    return <AppInlineLoader size={16} className="py-6" message="Loading changes…" />
  }
  if (data.error) return <TerminalGitEmpty variant="error" message={data.error} />
  if (!data.isRepo) return <TerminalGitEmpty variant="not-repo" />
  if (data.files.length === 0) return <TerminalGitEmpty variant="clean" />

  const hasStaged = data.staged.length > 0
  const hasUnstaged = data.unstaged.length > 0

  return (
    <div className={s.sectionWrap}>
      {hasStaged && (
        <CollapsibleSection
          title="Staged Changes"
          count={data.staged.length}
          isOpen={!data.collapsed['staged']}
          onToggle={() => data.toggleSection('staged')}
        >
          <div className="px-1 pb-1">
            {data.staged.map((file) => (
              <TerminalGitFileRow
                key={`s-${file.path}`}
                file={file}
                category={categorizeByIndex(file)}
                onOpen={data.onFileClick}
              />
            ))}
          </div>
        </CollapsibleSection>
      )}
      {hasUnstaged && (
        <CollapsibleSection
          title="Changes"
          count={data.unstaged.length}
          isOpen={!data.collapsed['unstaged']}
          onToggle={() => data.toggleSection('unstaged')}
        >
          <div className="px-1 pb-1">
            {data.unstaged.map((file) => (
              <TerminalGitFileRow
                key={`u-${file.path}`}
                file={file}
                category={categorizeFile(file)}
                onOpen={data.onFileClick}
              />
            ))}
          </div>
        </CollapsibleSection>
      )}
    </div>
  )
}
