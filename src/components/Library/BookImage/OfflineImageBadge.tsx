import { WifiOff } from 'lucide-react'

/**
 * Subtle badge layered on top of an image when its src points at the
 * offline cache (`library-image://...`). Provides a clear visual cue that
 * the image is reading from local disk and will keep working without
 * internet.
 */
export function OfflineImageBadge() {
  return (
    <div
      className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-500/10 backdrop-blur-sm border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[10px] font-medium pointer-events-none"
      title="Stored offline — viewable without internet"
    >
      <WifiOff size={10} />
      <span>Offline</span>
    </div>
  )
}
