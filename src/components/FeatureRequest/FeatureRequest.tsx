import { Lightbulb, RotateCcw, Send } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SectionHeader } from '@/components/ui/section-header'
import { Textarea } from '@/components/ui/textarea'

import { CATEGORY_OPTIONS, PRIORITY_OPTIONS } from './FeatureRequest.constants'
import {
  containerClass,
  footerClass,
  footerInnerClass,
  formInnerClass,
  formScrollClass,
  headerClass,
  headerInnerClass,
  helperTextClass,
} from './FeatureRequest.styles'
import { FeatureRequestField } from './components/FeatureRequestField'
import { FeatureRequestSelect } from './components/FeatureRequestSelect'
import { useFeatureRequestData } from './useFeatureRequestData'

export function FeatureRequest() {
  const data = useFeatureRequestData()
  const { form, canSubmit } = data

  return (
    <div className={containerClass}>
      <div className={headerClass}>
        <div className={headerInnerClass}>
          <SectionHeader icon={Lightbulb} title="Request a Feature" />
          <p className={helperTextClass}>
            Have an idea? Share the full details below and it goes straight to the team.
          </p>
        </div>
      </div>

      <div className={formScrollClass}>
        <div className={formInnerClass}>
          <FeatureRequestField label="Title" htmlFor="feature-title">
            <Input
              id="feature-title"
              value={form.title}
              onChange={(e) => data.setTitle(e.target.value)}
              placeholder="Short summary of the feature"
            />
          </FeatureRequestField>

          <FeatureRequestField label="Category">
            <FeatureRequestSelect
              ariaLabel="Category"
              value={form.category}
              options={CATEGORY_OPTIONS}
              onChange={data.setCategory}
            />
          </FeatureRequestField>

          <FeatureRequestField label="Priority">
            <FeatureRequestSelect
              ariaLabel="Priority"
              value={form.priority}
              options={PRIORITY_OPTIONS}
              onChange={data.setPriority}
            />
          </FeatureRequestField>

          <FeatureRequestField label="Problem it solves" htmlFor="feature-problem">
            <Textarea
              id="feature-problem"
              value={form.problem}
              onChange={(e) => data.setProblem(e.target.value)}
              placeholder="What problem or pain point does this address?"
            />
          </FeatureRequestField>

          <FeatureRequestField label="Description" htmlFor="feature-description">
            <Textarea
              id="feature-description"
              value={form.description}
              onChange={(e) => data.setDescription(e.target.value)}
              placeholder="Describe the feature in full detail"
            />
          </FeatureRequestField>

          <FeatureRequestField label="Expected behavior" htmlFor="feature-expected">
            <Textarea
              id="feature-expected"
              value={form.expectedBehavior}
              onChange={(e) => data.setExpectedBehavior(e.target.value)}
              placeholder="What should it do when it works?"
            />
          </FeatureRequestField>

          <FeatureRequestField label="Email / contact" htmlFor="feature-email" optional>
            <Input
              id="feature-email"
              type="email"
              value={form.email}
              onChange={(e) => data.setEmail(e.target.value)}
              placeholder="you@example.com"
              disabled={data.emailLocked}
            />
          </FeatureRequestField>
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
            Submit Request
          </Button>
        </div>
      </div>
    </div>
  )
}
