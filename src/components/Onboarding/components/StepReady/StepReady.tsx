import { Sparkles } from 'lucide-react'

import { AppShowcase } from '../AppShowcase'

export function StepReady(): React.JSX.Element {
  return (
    <div className="flex flex-col items-center text-center py-4">
      <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/10 flex items-center justify-center mb-8">
        <Sparkles size={36} className="text-green-500" />
      </div>

      <h2 className="text-3xl font-bold tracking-tight text-foreground">
        You&apos;re all set!
      </h2>
      <p className="text-base text-muted-foreground/50 mt-3 max-w-md font-light">
        Here&apos;s everything waiting for you inside Genisys.
      </p>

      <div className="mt-10 w-full max-w-3xl">
        <AppShowcase />
      </div>
    </div>
  )
}
