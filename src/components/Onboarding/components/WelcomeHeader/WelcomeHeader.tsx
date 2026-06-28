import { GenisysIcon } from '@/components/GenisysIcon'

export function WelcomeHeader(): React.JSX.Element {
  return (
    <div className="flex flex-col items-center text-center pt-20 pb-16">
      <div className="relative group mb-8">
        <div className="absolute inset-0 rounded-[22px] bg-primary/15 blur-2xl scale-[1.8] animate-pulse" />
        <div className="relative w-[72px] h-[72px] rounded-[22px] bg-gradient-to-b from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center">
          <GenisysIcon size={38} className="text-primary" />
        </div>
      </div>

      <h1 className="text-[42px] font-bold tracking-tight text-foreground leading-none">
        Welcome to Genisys
      </h1>
      <p className="text-base text-muted-foreground/60 mt-3 max-w-md font-light">
        Your developer operating system — review, explore, and ship with
        confidence.
      </p>
    </div>
  );
}
