import { Bug, RotateCcw, Send } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SectionHeader } from '@/components/ui/section-header'
import { Textarea } from '@/components/ui/textarea'

import {
  containerClass,
  footerClass,
  footerInnerClass,
  formInnerClass,
  formScrollClass,
  headerClass,
  headerInnerClass,
  helperTextClass
} from './BugReportTab.styles'
import { BugReportField } from './components/BugReportField'
import { SeveritySelect } from './components/SeveritySelect'
import { useBugReportData } from './useBugReportData'

export function BugReportTab() {
  const data = useBugReportData()
  const { form, canSubmit } = data

  return (
    <div className={containerClass}>
      <div className={headerClass}>
        <div className={headerInnerClass}>
          <SectionHeader icon={Bug} title="Report a Bug" />
          <p className={helperTextClass}>Found a bug? Describe it below.</p>
        </div>
      </div>

      <div className={formScrollClass}>
        <div className={formInnerClass}>
        <BugReportField label="Title" htmlFor="bug-title">
          <Input
            id="bug-title"
            value={form.title}
            onChange={(e) => data.setTitle(e.target.value)}
            placeholder="Short summary of the bug"
          />
        </BugReportField>

        <BugReportField label="Description" htmlFor="bug-description">
          <Textarea
            id="bug-description"
            value={form.description}
            onChange={(e) => data.setDescription(e.target.value)}
            placeholder="What happened?"
          />
        </BugReportField>

        <BugReportField label="Steps to reproduce" htmlFor="bug-steps">
          <Textarea
            id="bug-steps"
            value={form.steps}
            onChange={(e) => data.setSteps(e.target.value)}
            placeholder="1. … 2. … 3. …"
          />
        </BugReportField>

        <BugReportField label="Severity">
          <SeveritySelect value={form.severity} onChange={data.setSeverity} />
        </BugReportField>

        <BugReportField label="Email / contact" htmlFor="bug-email" optional>
          <Input
            id="bug-email"
            type="email"
            value={form.email}
            onChange={(e) => data.setEmail(e.target.value)}
            placeholder="you@example.com"
            disabled={data.emailLocked}
          />
        </BugReportField>
        </div>
      </div>

      <div className={footerClass}>
        <div className={footerInnerClass}>
          <Button variant="ghost" size="sm" onClick={data.reset}>
            <RotateCcw />
            Reset
          </Button>
          <Button size="sm" disabled={!canSubmit} onClick={data.handleSubmit}>
            <Send />
            Submit Report
          </Button>
        </div>
      </div>
    </div>
  )
}
